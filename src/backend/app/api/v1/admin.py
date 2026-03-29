import asyncio
import os
import re
import uuid

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import decrypt, encrypt
from app.core.security import hash_password, require_admin
from app.models.auth import OIDCProvider
from app.models.mapping import UserServiceMapping
from app.models.recap import HistorySnapshot, YearlyRecap
from app.models.service import ServiceConnector
from app.models.share import GlobalConfig
from app.models.user import User
from app.schemas.auth import OIDCProviderCreate, OIDCProviderResponse, OIDCProviderUpdate, UserResponse
from app.core.utils import to_uuid

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
async def dashboard(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    user_count = (await db.execute(select(func.count(User.id)))).scalar()
    active_services = (await db.execute(
        select(func.count(ServiceConnector.id)).where(ServiceConnector.is_active.is_(True))
    )).scalar()
    running_jobs = (await db.execute(
        select(func.count(YearlyRecap.id)).where(
            YearlyRecap.status.in_(["collecting", "processing", "fetching_posters"])
        )
    )).scalar()

    return {
        "user_count": user_count,
        "active_services": active_services,
        "running_jobs": running_jobs,
        "recent_logs": [],
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.get("/users-full")
async def list_users_full(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Users with their service mappings."""
    users_result = await db.execute(select(User).order_by(User.created_at.desc()))
    mappings_result = await db.execute(select(UserServiceMapping))

    mappings_by_user = {}
    for m in mappings_result.scalars().all():
        uid = str(m.user_id)
        if uid not in mappings_by_user:
            mappings_by_user[uid] = []
        mappings_by_user[uid].append({"service_type": m.service_type, "service_username": m.service_username, "id": str(m.id)})

    out = []
    for u in users_result.scalars().all():
        user_data = UserResponse.model_validate(u).model_dump()
        user_data["mappings"] = mappings_by_user.get(str(u.id), [])
        out.append(user_data)
    return out


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    data: dict,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    email = data.get("email", "")
    password = data.get("password", "")
    display_name = data.get("display_name", "")
    role = data.get("role", "user")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email et mot de passe requis")
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = User(email=email, hashed_password=hash_password(password), display_name=display_name, role=role)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID, updates: dict,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == to_uuid(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    if "display_name" in updates and updates["display_name"]:
        user.display_name = updates["display_name"]
    if "email" in updates and updates["email"]:
        user.email = updates["email"]
    if "role" in updates:
        user.role = updates["role"]
    if "is_active" in updates:
        user.is_active = updates["is_active"]
    if "password" in updates:
        user.hashed_password = hash_password(updates["password"])
    if updates.get("reset_password"):
        # Generate a temporary password and return it
        import secrets
        temp = secrets.token_urlsafe(12)
        user.hashed_password = hash_password(temp)
        await db.commit()
        await db.refresh(user)
        resp = UserResponse.model_validate(user)
        return {"user": resp, "temp_password": temp}

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.get("/all-services")
async def list_all_services(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """List all services across all users (for admin slide manager)."""
    result = await db.execute(select(ServiceConnector).where(ServiceConnector.is_active.is_(True)))
    return [{"id": str(s.id), "service_type": s.service_type, "base_url": s.base_url, "is_active": s.is_active} for s in result.scalars().all()]


@router.get("/service-users")
async def get_service_users(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """List users from each connected service."""
    import httpx
    from app.core.encryption import decrypt

    result = await db.execute(select(ServiceConnector).where(ServiceConnector.is_active.is_(True)))
    services = result.scalars().all()
    out = {}

    async with httpx.AsyncClient(timeout=10) as client:
        for svc in services:
            if svc.service_type in ("tmdb",):
                continue
            key = decrypt(svc.api_key_enc)
            users = []
            try:
                if svc.service_type == "tautulli":
                    resp = await client.get(f"{svc.base_url}/api/v2", params={"apikey": key, "cmd": "get_users_table", "length": "100"})
                    if resp.status_code == 200:
                        data = resp.json().get("response", {}).get("data", {})
                        for u in (data.get("data", []) if isinstance(data, dict) else []):
                            name = u.get("friendly_name", "?")
                            if name and name != "Local":
                                users.append({"id": str(u.get("user_id", "")), "name": name, "email": u.get("email", "")})
                elif svc.service_type == "audiobookshelf":
                    resp = await client.get(f"{svc.base_url}/api/users", headers={"Authorization": f"Bearer {key}"})
                    if resp.status_code == 200:
                        raw = resp.json()
                        for u in (raw if isinstance(raw, list) else raw.get("users", [])):
                            users.append({"id": str(u.get("id", "")), "name": u.get("username", "?")})
                elif svc.service_type == "jellyfin":
                    resp = await client.get(f"{svc.base_url}/Users", headers={"X-Emby-Token": key})
                    if resp.status_code == 200:
                        for u in resp.json():
                            users.append({"id": str(u.get("Id", "")), "name": u.get("Name", "?")})
                elif svc.service_type == "romm":
                    parts = key.split(":", 1)
                    if len(parts) == 2:
                        resp = await client.post(f"{svc.base_url}/api/token", data={"username": parts[0], "password": parts[1], "scope": "me.read"})
                        if resp.status_code == 200:
                            token = resp.json().get("access_token")
                            # ROMM may not expose user list — add current user
                            users.append({"id": "self", "name": parts[0]})
                elif svc.service_type in ("komga", "booklore"):
                    # Basic auth — add the configured user
                    parts = key.split(":", 1)
                    if len(parts) == 2:
                        users.append({"id": "self", "name": parts[0]})
            except Exception:
                pass

            if users:
                out[svc.service_type] = users

    return out


@router.get("/mapping")
async def get_mappings(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserServiceMapping))
    mappings = result.scalars().all()
    # Return as { user_id: { service_type: username } }
    out = {}
    for m in mappings:
        uid = str(m.user_id)
        if uid not in out:
            out[uid] = {}
        out[uid][m.service_type] = m.service_username
    return out


@router.put("/mapping")
async def save_mappings(data: dict, _admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    # data = { user_id: { service_type: username, ... }, ... }
    for user_id_str, services in data.items():
        user_id = uuid.UUID(user_id_str)
        for service_type, username in services.items():
            if not username or not username.strip():
                # Delete mapping if empty
                result = await db.execute(
                    select(UserServiceMapping).where(
                        UserServiceMapping.user_id == to_uuid(user_id),
                        UserServiceMapping.service_type == service_type,
                    )
                )
                existing = result.scalar_one_or_none()
                if existing:
                    await db.delete(existing)
                continue

            result = await db.execute(
                select(UserServiceMapping).where(
                    UserServiceMapping.user_id == to_uuid(user_id),
                    UserServiceMapping.service_type == service_type,
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                existing.service_username = username.strip()
            else:
                db.add(UserServiceMapping(user_id=user_id, service_type=service_type, service_username=username.strip()))

    await db.commit()
    return {"status": "ok"}


# ── Recap management ──

@router.get("/recaps")
async def admin_list_recaps(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(YearlyRecap).order_by(YearlyRecap.year.desc())
    )
    recaps = result.scalars().all()
    out = []
    for r in recaps:
        # Get user display name
        user_result = await db.execute(select(User).where(User.id == r.user_id))
        user = user_result.scalar_one_or_none()
        out.append({
            "id": str(r.id),
            "user_id": str(r.user_id),
            "user_name": user.display_name if user else "?",
            "year": r.year,
            "status": r.status,
            "progress": r.progress,
            "is_active": r.is_active,
            "available_from": r.available_from.isoformat() if r.available_from else None,
            "available_until": r.available_until.isoformat() if r.available_until else None,
            "slide_settings": r.slide_settings,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "error_message": r.error_message,
        })
    return out


@router.patch("/recaps/{recap_id}")
async def admin_update_recap(
    recap_id: uuid.UUID, updates: dict,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(YearlyRecap).where(YearlyRecap.id == to_uuid(recap_id)))
    recap = result.scalar_one_or_none()
    if not recap:
        raise HTTPException(status_code=404, detail="Recap introuvable")

    if "is_active" in updates:
        recap.is_active = updates["is_active"]
    if "available_from" in updates:
        recap.available_from = updates["available_from"]
    if "available_until" in updates:
        recap.available_until = updates["available_until"]
    if "slide_settings" in updates:
        recap.slide_settings = updates["slide_settings"]

    await db.commit()
    return {"status": "ok"}


@router.delete("/recaps/{recap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_recap(
    recap_id: uuid.UUID,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(YearlyRecap).where(YearlyRecap.id == to_uuid(recap_id)))
    recap = result.scalar_one_or_none()
    if not recap:
        raise HTTPException(status_code=404, detail="Recap introuvable")

    # Delete snapshot first
    snap_result = await db.execute(select(HistorySnapshot).where(HistorySnapshot.recap_id == recap.id))
    snap = snap_result.scalar_one_or_none()
    if snap:
        await db.delete(snap)

    await db.delete(recap)
    await db.commit()


@router.get("/config")
async def get_config(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(GlobalConfig))
    configs = result.scalars().all()
    return {c.key: c.value for c in configs}


@router.patch("/config")
async def update_config(updates: dict, _admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    for key, value in updates.items():
        result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == key))
        cfg = result.scalar_one_or_none()
        if cfg:
            cfg.value = value
        else:
            db.add(GlobalConfig(key=key, value=value))
    await db.commit()
    return {"status": "ok"}


# ── Music download ──

MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "music_cache")
os.makedirs(MUSIC_DIR, exist_ok=True)


def _extract_youtube_id(url: str) -> str | None:
    m = re.search(r"(?:youtu\.be/|youtube\.com/(?:embed/|v/|watch\?v=|shorts/))([a-zA-Z0-9_-]{11})", url)
    return m.group(1) if m else None


@router.post("/music/download")
async def download_music(updates: dict, _admin=Depends(require_admin)):
    """Download audio from YouTube URL using yt-dlp."""
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("Music download called with: %s", updates)
    url = updates.get("url", "")
    video_id = _extract_youtube_id(url)
    if not video_id:
        raise HTTPException(400, "Invalid YouTube URL")

    output_path = os.path.join(MUSIC_DIR, f"{video_id}.mp3")
    audio_url = f"/api/v1/media/music/{video_id}.mp3"

    # Get video metadata (title + duration)
    title = ""
    duration = 0
    try:
        meta_proc = await asyncio.create_subprocess_exec(
            "yt-dlp", "--print", "title", "--print", "duration", "--no-download", url,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        meta_out, _ = await meta_proc.communicate()
        lines = meta_out.decode().strip().split("\n")
        if len(lines) >= 1:
            title = lines[0].strip()
        if len(lines) >= 2:
            try:
                duration = int(float(lines[1].strip()))
            except (ValueError, IndexError):
                pass
    except Exception:
        pass

    # Already downloaded?
    if os.path.exists(output_path):
        logger.warning("File already exists: %s", output_path)
        return {"status": "ok", "video_id": video_id, "path": audio_url, "title": title, "duration": duration}

    try:
        proc = await asyncio.create_subprocess_exec(
            "yt-dlp", "-x", "--audio-format", "mp3", "--audio-quality", "5",
            "-o", output_path.replace(".mp3", ".%(ext)s"),
            url,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise HTTPException(500, f"yt-dlp error: {stderr.decode()[:500]}")

        # yt-dlp might create with different extension then convert
        if not os.path.exists(output_path):
            for f in os.listdir(MUSIC_DIR):
                if f.startswith(video_id):
                    actual = os.path.join(MUSIC_DIR, f)
                    if actual != output_path:
                        os.rename(actual, output_path)
                    break

        if not os.path.exists(output_path):
            raise HTTPException(500, "Download completed but file not found")

        return {"status": "ok", "video_id": video_id, "path": audio_url, "title": title, "duration": duration}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Music download error")
        raise HTTPException(500, str(e))


@router.get("/music/file/{filename}")
async def serve_music(filename: str):
    """Serve a downloaded music file."""
    # Sanitize filename
    if not re.match(r"^[a-zA-Z0-9_-]+\.mp3$", filename):
        raise HTTPException(400, "Invalid filename")
    path = os.path.join(MUSIC_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(404, "File not found")
    return FileResponse(path, media_type="audio/mpeg")


# ── OIDC Provider management ──

@router.get("/oidc-providers", response_model=list[OIDCProviderResponse])
async def list_oidc_providers(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OIDCProvider).order_by(OIDCProvider.created_at.desc()))
    return [OIDCProviderResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/oidc-providers", response_model=OIDCProviderResponse, status_code=status.HTTP_201_CREATED)
async def create_oidc_provider(
    data: OIDCProviderCreate,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(OIDCProvider).where(OIDCProvider.name == data.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Un provider avec ce nom existe déjà")

    provider = OIDCProvider(
        name=data.name,
        issuer_url=data.issuer_url.rstrip("/"),
        client_id=data.client_id,
        client_secret=encrypt(data.client_secret),
        scopes=data.scopes,
    )
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return OIDCProviderResponse.model_validate(provider)


@router.patch("/oidc-providers/{provider_id}", response_model=OIDCProviderResponse)
async def update_oidc_provider(
    provider_id: uuid.UUID, data: OIDCProviderUpdate,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(OIDCProvider).where(OIDCProvider.id == to_uuid(provider_id)))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider introuvable")

    if data.name is not None:
        provider.name = data.name
    if data.issuer_url is not None:
        provider.issuer_url = data.issuer_url.rstrip("/")
    if data.client_id is not None:
        provider.client_id = data.client_id
    if data.client_secret is not None:
        provider.client_secret = encrypt(data.client_secret)
    if data.scopes is not None:
        provider.scopes = data.scopes
    if data.is_active is not None:
        provider.is_active = data.is_active

    await db.commit()
    await db.refresh(provider)
    return OIDCProviderResponse.model_validate(provider)


@router.delete("/oidc-providers/{provider_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_oidc_provider(
    provider_id: uuid.UUID,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(OIDCProvider).where(OIDCProvider.id == to_uuid(provider_id)))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider introuvable")
    await db.delete(provider)
    await db.commit()


@router.post("/oidc-providers/{provider_id}/test")
async def test_oidc_provider(
    provider_id: uuid.UUID,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """Test OIDC discovery for a saved provider."""
    result = await db.execute(select(OIDCProvider).where(OIDCProvider.id == to_uuid(provider_id)))
    provider = result.scalar_one_or_none()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider introuvable")

    issuer_url = provider.issuer_url.rstrip("/")

    # Try multiple discovery URL patterns (Authentik, Keycloak, standard)
    discovery_urls = [
        f"{issuer_url}/.well-known/openid-configuration",
    ]
    # Authentik: issuer is the application slug URL
    # Keycloak: issuer may be /realms/<realm>
    # Some providers serve discovery at the root
    if not issuer_url.endswith("/.well-known/openid-configuration"):
        # Also try with trailing slash variant
        discovery_urls.append(f"{issuer_url}/.well-known/openid-configuration/")

    last_error = "Aucune reponse valide"
    tried = []

    for url in discovery_urls:
        for verify_ssl in (True, False):
            try:
                async with httpx.AsyncClient(verify=verify_ssl, timeout=10, follow_redirects=True) as http:
                    resp = await http.get(url)
                    tried.append(f"{url} -> {resp.status_code}")
                    if resp.status_code == 200:
                        disco = resp.json()
                        return {
                            "status": "ok",
                            "ssl_verified": verify_ssl,
                            "issuer": disco.get("issuer", ""),
                            "authorization_endpoint": disco.get("authorization_endpoint", ""),
                            "token_endpoint": disco.get("token_endpoint", ""),
                            "userinfo_endpoint": disco.get("userinfo_endpoint", ""),
                        }
                    last_error = f"HTTP {resp.status_code}"
            except Exception as e:
                tried.append(f"{url} -> {e}")
                last_error = str(e)

    return {
        "status": "error",
        "detail": f"Impossible de joindre le provider. Erreur: {last_error}",
        "tried": tried,
    }


@router.post("/reset")
async def reset_wrapparr(
    body: dict,
    _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    """Reset all data and return to setup wizard."""
    confirm = body.get("confirm", "")
    if confirm != "RESET_WRAPPARR":
        raise HTTPException(status_code=400, detail="Confirmation requise: envoyez {\"confirm\": \"RESET_WRAPPARR\"}")

    from app.core.database import Base, engine

    # Drop and recreate all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    return {"status": "ok", "message": "Toutes les donnees ont ete supprimees. Redemarrez l'application."}
