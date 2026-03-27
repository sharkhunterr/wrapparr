import logging
import secrets

import httpx
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import decrypt
from app.core.security import create_access_token, create_refresh_token, get_current_user
from app.models.auth import OIDCProvider
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, OIDCProviderPublic, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import (
    authenticate_user,
    refresh_access_token,
    register_user,
    revoke_refresh_token,
    issue_tokens_for_user,
)

logger = logging.getLogger("wrapparr")


async def _discover_oidc(issuer_url: str) -> dict:
    """Fetch OIDC discovery document, tolerant of self-signed certs."""
    base = issuer_url.rstrip("/")
    urls_to_try = [
        f"{base}/.well-known/openid-configuration",
        f"{base}/.well-known/openid-configuration/",
    ]
    last_error = None
    for url in urls_to_try:
        for verify in (True, False):
            try:
                async with httpx.AsyncClient(verify=verify, timeout=10) as http:
                    resp = await http.get(url)
                    if resp.status_code == 200:
                        return resp.json()
            except Exception as e:
                last_error = e
                logger.warning("OIDC discovery %s (verify=%s): %s", url, verify, e)
    raise HTTPException(
        status_code=502,
        detail=f"Impossible de contacter le provider OIDC. Verifiez l'Issuer URL. Derniere erreur: {last_error}",
    )

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        user, access, refresh = await register_user(db, data.email, data.password, data.display_name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )
    return AuthResponse(access_token=access, user=UserResponse.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    try:
        user, access, refresh = await authenticate_user(db, data.email, data.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )
    return AuthResponse(access_token=access, user=UserResponse.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(None),
):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de rafraîchissement manquant")
    try:
        access = await refresh_access_token(db, refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    return TokenResponse(access_token=access)


@router.post("/sso/exchange")
async def sso_exchange(request: Request, response: Response):
    """Exchange a one-time SSO code for access + refresh tokens. Code is deleted after use."""
    body = await request.json()
    code = body.get("code", "")
    if not code:
        raise HTTPException(400, "Missing code")

    redis = request.app.state.redis
    data = await redis.get(f"sso_code:{code}")
    if not data:
        raise HTTPException(401, "Code invalide ou expire")

    # Delete immediately (one-time use)
    await redis.delete(f"sso_code:{code}")

    parts = data.split("||")
    if len(parts) != 2:
        raise HTTPException(500, "Invalid stored data")

    access, refresh = parts
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600,
    )
    return {"access_token": access}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(None),
):
    if refresh_token:
        await revoke_refresh_token(db, refresh_token)
    response.delete_cookie("refresh_token")


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)


# ── SSO / OIDC ──

@router.get("/sso/providers", response_model=list[OIDCProviderPublic])
async def list_sso_providers(db: AsyncSession = Depends(get_db)):
    """Public endpoint: list active SSO providers (name + id only)."""
    result = await db.execute(
        select(OIDCProvider).where(OIDCProvider.is_active.is_(True)).order_by(OIDCProvider.name)
    )
    return [OIDCProviderPublic.model_validate(p) for p in result.scalars().all()]


def _get_base_url(request: Request) -> str:
    """Get the public-facing base URL from query param, X-Forwarded headers, or fallback."""
    # Explicit origin query param (most reliable)
    origin = request.query_params.get("origin")
    if origin:
        return origin.rstrip("/")

    # Reverse proxy headers
    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host")
    if forwarded_host:
        proto = forwarded_proto or "http"
        return f"{proto}://{forwarded_host}"

    # Referer header fallback
    referer = request.headers.get("referer")
    if referer:
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        return f"{parsed.scheme}://{parsed.netloc}"

    return str(request.base_url).rstrip("/")


@router.get("/sso/{provider_id}/authorize")
async def sso_authorize(provider_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Redirect user to OIDC provider for authentication."""
    result = await db.execute(
        select(OIDCProvider).where(OIDCProvider.id == provider_id, OIDCProvider.is_active.is_(True))
    )
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider SSO introuvable ou inactif")

    client_secret = decrypt(provider.client_secret)

    # Build callback URL from the public-facing origin
    base_url = _get_base_url(request)
    redirect_uri = f"{base_url}/api/v1/auth/sso/{provider_id}/callback"

    disco = await _discover_oidc(provider.issuer_url)

    authorization_endpoint = disco.get("authorization_endpoint")
    if not authorization_endpoint:
        raise HTTPException(status_code=502, detail="authorization_endpoint manquant dans la decouverte OIDC")

    client = AsyncOAuth2Client(
        client_id=provider.client_id,
        client_secret=client_secret,
        scope=provider.scopes,
        redirect_uri=redirect_uri,
    )

    state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)

    # Store state + nonce + origin in Redis for validation
    redis = request.app.state.redis
    await redis.setex(f"oidc_state:{state}", 600, f"{provider_id}|{nonce}|{base_url}")

    uri, _ = client.create_authorization_url(
        authorization_endpoint,
        state=state,
        nonce=nonce,
    )

    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=uri)


@router.get("/sso/{provider_id}/callback")
async def sso_callback(
    provider_id: str,
    request: Request,
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Handle OIDC callback: exchange code for tokens, create/login user."""
    # Validate state
    redis = request.app.state.redis
    stored = await redis.get(f"oidc_state:{state}")
    if not stored:
        raise HTTPException(status_code=400, detail="State OIDC invalide ou expiré")
    await redis.delete(f"oidc_state:{state}")

    parts = stored.split("|", 2)
    stored_provider_id = parts[0]
    nonce = parts[1] if len(parts) > 1 else ""
    stored_origin = parts[2] if len(parts) > 2 else None

    if stored_provider_id != provider_id:
        raise HTTPException(status_code=400, detail="Provider ID mismatch")

    # Load provider
    result = await db.execute(
        select(OIDCProvider).where(OIDCProvider.id == provider_id, OIDCProvider.is_active.is_(True))
    )
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider SSO introuvable")

    client_secret = decrypt(provider.client_secret)
    base_url = stored_origin or _get_base_url(request)
    redirect_uri = f"{base_url}/api/v1/auth/sso/{provider_id}/callback"

    disco = await _discover_oidc(provider.issuer_url)
    token_endpoint = disco.get("token_endpoint")
    userinfo_endpoint = disco.get("userinfo_endpoint")

    # Exchange authorization code for tokens (allow self-signed certs)
    import ssl
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    client = AsyncOAuth2Client(
        client_id=provider.client_id,
        client_secret=client_secret,
        redirect_uri=redirect_uri,
        verify=False,
        timeout=10,
    )

    try:
        token_resp = await client.fetch_token(
            token_endpoint,
            code=code,
            grant_type="authorization_code",
        )
    except Exception as e:
        logger.error("OIDC token exchange failed: %s", e)
        raise HTTPException(status_code=502, detail=f"Erreur lors de l'echange du code OIDC: {e}")

    # Get user info
    userinfo = None
    if userinfo_endpoint:
        try:
            client.token = token_resp
            resp = await client.get(userinfo_endpoint)
            userinfo = resp.json()
        except Exception as e:
            logger.warning("OIDC userinfo failed: %s", e)

    await client.aclose()

    if not userinfo:
        # Fallback: decode ID token
        from jose import jwt as jose_jwt
        id_token = token_resp.get("id_token", "")
        if id_token:
            userinfo = jose_jwt.decode(id_token, options={"verify_signature": False})
        else:
            raise HTTPException(status_code=502, detail="Pas de userinfo ni d'id_token dans la reponse OIDC")

    sub = userinfo.get("sub")
    email = userinfo.get("email")
    display_name = userinfo.get("preferred_username") or userinfo.get("name") or email

    if not sub or not email:
        raise HTTPException(status_code=400, detail="Le provider n'a pas fourni sub ou email")

    # Find or create user
    result = await db.execute(
        select(User).where(User.oidc_sub == sub, User.oidc_provider_id == provider.id)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Check if email already exists (link accounts)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            # Link existing local user to OIDC
            user.oidc_provider_id = provider.id
            user.oidc_sub = sub
        else:
            # Create new user
            user = User(
                email=email,
                display_name=display_name,
                role="user",
                oidc_provider_id=provider.id,
                oidc_sub=sub,
            )
            db.add(user)
            await db.flush()

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")

    access, refresh = await issue_tokens_for_user(db, user)

    # Generate ephemeral code (one-time use, expires in 60s)
    import secrets
    sso_code = secrets.token_urlsafe(32)
    redis = request.app.state.redis
    await redis.setex(f"sso_code:{sso_code}", 60, f"{access}||{refresh}")

    from fastapi.responses import RedirectResponse
    response = RedirectResponse(url=f"{base_url}/login?sso_code={sso_code}")
    return response
