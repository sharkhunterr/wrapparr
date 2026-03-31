"""First-run setup wizard API."""
import logging
import traceback
import httpx
from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger("wrapparr.setup")
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import encrypt
from app.core.security import hash_password
from app.models.mapping import UserServiceMapping
from app.models.service import ServiceConnector
from app.models.user import User
from app.schemas.setup import (
    SetupFetchUsersRequest,
    SetupFinishRequest,
    SetupStatusResponse,
    SetupTestServiceRequest,
    SetupTestServiceResponse,
    ServiceUser,
)
from app.services.auth_service import issue_tokens_for_user

router = APIRouter(prefix="/setup", tags=["setup"])


async def _is_setup_needed(db: AsyncSession) -> bool:
    result = await db.execute(select(func.count()).select_from(User))
    return result.scalar() == 0


async def _guard_setup(db: AsyncSession):
    if not await _is_setup_needed(db):
        raise HTTPException(status_code=403, detail="Setup already completed")


async def _fetch_service_users(service_type: str, base_url: str, api_key: str) -> list[dict]:
    users = []
    async with httpx.AsyncClient(timeout=15) as client:
        if service_type == "tautulli":
            resp = await client.get(f"{base_url}/api/v2", params={"apikey": api_key, "cmd": "get_users_table", "length": "100"})
            if resp.status_code == 200:
                data = resp.json().get("response", {}).get("data", {})
                for u in (data.get("data", []) if isinstance(data, dict) else []):
                    name = u.get("friendly_name", "?")
                    if name and name != "Local":
                        users.append({"id": str(u.get("user_id", "")), "name": name, "email": u.get("email", "")})
        elif service_type == "jellyfin":
            resp = await client.get(f"{base_url}/Users", headers={"X-Emby-Token": api_key})
            if resp.status_code == 200:
                for u in resp.json():
                    users.append({"id": str(u.get("Id", "")), "name": u.get("Name", "?")})
        elif service_type == "audiobookshelf":
            resp = await client.get(f"{base_url}/api/users", headers={"Authorization": f"Bearer {api_key}"})
            if resp.status_code == 200:
                raw = resp.json()
                for u in (raw if isinstance(raw, list) else raw.get("users", [])):
                    users.append({"id": str(u.get("id", "")), "name": u.get("username", "?")})
    return users


@router.get("/status", response_model=SetupStatusResponse)
async def get_setup_status(db: AsyncSession = Depends(get_db)):
    return SetupStatusResponse(needed=await _is_setup_needed(db))


@router.post("/test-service", response_model=SetupTestServiceResponse)
async def test_service(data: SetupTestServiceRequest, db: AsyncSession = Depends(get_db)):
    await _guard_setup(db)
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if data.service_type == "tautulli":
                resp = await client.get(f"{data.base_url}/api/v2", params={"apikey": data.api_key, "cmd": "get_activity"})
                if resp.status_code == 200 and resp.json().get("response", {}).get("result") == "success":
                    return SetupTestServiceResponse(ok=True)
                return SetupTestServiceResponse(ok=False, error="Tautulli: reponse invalide")
            elif data.service_type == "jellyfin":
                resp = await client.get(f"{data.base_url}/System/Info", headers={"X-Emby-Token": data.api_key})
                if resp.status_code == 200:
                    return SetupTestServiceResponse(ok=True)
                return SetupTestServiceResponse(ok=False, error=f"Jellyfin: HTTP {resp.status_code}")
            elif data.service_type == "tmdb":
                resp = await client.get("https://api.themoviedb.org/3/configuration", params={"api_key": data.api_key})
                if resp.status_code == 200:
                    return SetupTestServiceResponse(ok=True)
                return SetupTestServiceResponse(ok=False, error="Cle API TMDB invalide" if resp.status_code == 401 else f"TMDB: HTTP {resp.status_code}")
            elif data.service_type == "overseerr":
                resp = await client.get(f"{data.base_url}/api/v1/status", headers={"X-Api-Key": data.api_key})
                if resp.status_code == 200:
                    return SetupTestServiceResponse(ok=True)
                return SetupTestServiceResponse(ok=False, error=f"Overseerr: HTTP {resp.status_code}")
            else:
                return SetupTestServiceResponse(ok=False, error=f"Service non supporte: {data.service_type}")
    except Exception as e:
        return SetupTestServiceResponse(ok=False, error=str(e))


@router.post("/fetch-users", response_model=list[ServiceUser])
async def fetch_users(data: SetupFetchUsersRequest, db: AsyncSession = Depends(get_db)):
    await _guard_setup(db)
    try:
        users = await _fetch_service_users(data.service_type, data.base_url, data.api_key)
        return [ServiceUser(**u) for u in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/finish")
async def finish_setup(data: SetupFinishRequest, db: AsyncSession = Depends(get_db)):
    await _guard_setup(db)
    logger.info("Setup finish started: %s users, service=%s", len(data.users), data.service_type)

    try:
        return await _do_finish(data, db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Setup finish failed: %s\n%s", str(e), traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Setup error: {str(e)}")


async def _do_finish(data: SetupFinishRequest, db: AsyncSession):
    admin = None

    # 1. Create all users from the selected list
    for u in data.users:
        is_admin = u.role == "admin"

        if is_admin:
            # This is the admin — use provided email + password
            user = User(
                email=data.admin_email,
                hashed_password=hash_password(data.admin_password),
                display_name=u.display_name,
                role="admin",
            )
        else:
            # Regular user — use Tautulli email if available, otherwise auto-generate
            email = u.email if u.email else f"{data.service_type}.{u.service_username.lower().replace(' ', '_')}@local.wrapparr"
            user = User(
                email=email,
                hashed_password=None,
                display_name=u.display_name,
                role="user",
            )

        db.add(user)
        await db.flush()

        if is_admin and admin is None:
            admin = user

        # Create mapping
        db.add(UserServiceMapping(
            user_id=user.id,
            service_type=data.service_type,
            service_username=u.service_username,
        ))

    if not admin:
        raise HTTPException(status_code=400, detail="Au moins un utilisateur doit etre admin")

    # 2. Create service connector (owned by admin)
    svc = ServiceConnector(
        user_id=admin.id,
        service_type=data.service_type,
        display_name=data.service_display_name,
        base_url=data.service_base_url,
        api_key_enc=encrypt(data.service_api_key),
        is_active=True,
    )
    db.add(svc)

    # 3. Create optional services (TMDB, Overseerr, etc.)
    for opt in data.optional_services:
        opt_svc = ServiceConnector(
            user_id=admin.id,
            service_type=opt.service_type,
            display_name=opt.display_name or opt.service_type.capitalize(),
            base_url=opt.base_url,
            api_key_enc=encrypt(opt.api_key),
            is_active=True,
        )
        db.add(opt_svc)

    # 4. Store auth method in config
    from app.models.share import GlobalConfig
    db.add(GlobalConfig(key="auth_method", value=data.auth_method))

    await db.commit()

    # 5. Issue tokens for admin
    access, refresh = await issue_tokens_for_user(db, admin)

    return {
        "access_token": access,
        "refresh_token": refresh,
        "user": {
            "id": str(admin.id),
            "email": admin.email,
            "display_name": admin.display_name,
            "role": admin.role,
        },
    }
