"""Backup / Export / Import API for full configuration."""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.encryption import decrypt, encrypt
from app.core.security import require_admin, hash_password
from app.models.mapping import UserServiceMapping
from app.models.service import ServiceConnector
from app.models.share import GlobalConfig
from app.models.theme import ThemePack
from app.models.user import User
from app.models.phrase import CustomPhrase
from app.models.auth import OIDCProvider

logger = logging.getLogger("wrapparr.backup")

router = APIRouter(prefix="/backup", tags=["backup"])

BACKUP_VERSION = 1


@router.get("/export")
async def export_config(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Export all configuration as JSON."""

    # Users
    result = await db.execute(select(User))
    users = []
    for u in result.scalars().all():
        users.append({
            "id": str(u.id),
            "email": u.email,
            "display_name": u.display_name,
            "role": u.role,
            "is_active": u.is_active,
            "allow_comparison": u.allow_comparison,
            "theme_pack_id": str(u.theme_pack_id) if u.theme_pack_id else None,
        })

    # Service connectors (decrypt API keys for portability)
    result = await db.execute(select(ServiceConnector))
    services = []
    for s in result.scalars().all():
        try:
            api_key = decrypt(s.api_key_enc)
        except Exception:
            api_key = ""
        services.append({
            "user_id": str(s.user_id),
            "service_type": s.service_type,
            "display_name": s.display_name,
            "base_url": s.base_url,
            "api_key": api_key,
            "is_active": s.is_active,
        })

    # User service mappings
    result = await db.execute(select(UserServiceMapping))
    mappings = [
        {"user_id": str(m.user_id), "service_type": m.service_type, "service_username": m.service_username}
        for m in result.scalars().all()
    ]

    # Global config
    result = await db.execute(select(GlobalConfig))
    config = {c.key: c.value for c in result.scalars().all()}

    # Theme packs (custom only)
    result = await db.execute(select(ThemePack).where(ThemePack.is_builtin == False))
    themes = [
        {"name": t.name, "slug": t.slug, "config": t.config}
        for t in result.scalars().all()
    ]

    # OIDC providers
    result = await db.execute(select(OIDCProvider))
    oidc = []
    for p in result.scalars().all():
        try:
            secret = decrypt(p.client_secret) if p.client_secret else ""
        except Exception:
            secret = ""
        oidc.append({
            "name": p.name,
            "issuer_url": p.issuer_url,
            "client_id": p.client_id,
            "client_secret": secret,
            "scopes": p.scopes,
            "is_active": p.is_active,
        })

    # Custom phrases
    result = await db.execute(select(CustomPhrase))
    phrases = [
        {"user_id": str(p.user_id), "category": p.category, "text": p.text, "sort_order": p.sort_order, "mode": p.mode}
        for p in result.scalars().all()
    ]

    backup = {
        "_wrapparr_backup": True,
        "_version": BACKUP_VERSION,
        "_exported_at": datetime.now(timezone.utc).isoformat(),
        "users": users,
        "services": services,
        "mappings": mappings,
        "config": config,
        "themes": themes,
        "oidc_providers": oidc,
        "phrases": phrases,
    }

    return JSONResponse(
        content=backup,
        headers={"Content-Disposition": f"attachment; filename=wrapparr-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"},
    )


@router.post("/import")
async def import_config(file: UploadFile = File(...), _admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Import configuration from JSON backup file."""
    import json

    try:
        content = await file.read()
        data = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fichier JSON invalide: {e}")

    if not data.get("_wrapparr_backup"):
        raise HTTPException(status_code=400, detail="Ce fichier n'est pas un backup Wrapparr")

    imported = {"users": 0, "services": 0, "mappings": 0, "config": 0, "themes": 0, "oidc": 0, "phrases": 0}

    try:
        # ── Users ──
        email_to_id = {}
        for u in data.get("users", []):
            result = await db.execute(select(User).where(User.email == u["email"]))
            existing = result.scalar_one_or_none()
            if existing:
                existing.display_name = u.get("display_name", existing.display_name)
                existing.role = u.get("role", existing.role)
                existing.is_active = u.get("is_active", True)
                existing.allow_comparison = u.get("allow_comparison", True)
                email_to_id[u["email"]] = existing.id
            else:
                user = User(
                    email=u["email"],
                    display_name=u.get("display_name", u["email"]),
                    role=u.get("role", "user"),
                    is_active=u.get("is_active", True),
                    allow_comparison=u.get("allow_comparison", True),
                    hashed_password=None,
                )
                db.add(user)
                await db.flush()
                email_to_id[u["email"]] = user.id
                imported["users"] += 1

        # Map old user_id -> new user_id via email
        old_id_to_email = {u["id"]: u["email"] for u in data.get("users", [])}

        def resolve_user_id(old_id):
            email = old_id_to_email.get(old_id)
            return email_to_id.get(email) if email else None

        # ── Services ──
        for s in data.get("services", []):
            user_id = resolve_user_id(s.get("user_id"))
            if not user_id:
                continue
            result = await db.execute(
                select(ServiceConnector).where(ServiceConnector.user_id == user_id, ServiceConnector.service_type == s["service_type"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                existing.display_name = s.get("display_name", existing.display_name)
                existing.base_url = s.get("base_url", existing.base_url)
                if s.get("api_key"):
                    existing.api_key_enc = encrypt(s["api_key"])
                existing.is_active = s.get("is_active", True)
            else:
                svc = ServiceConnector(
                    user_id=user_id,
                    service_type=s["service_type"],
                    display_name=s.get("display_name", s["service_type"]),
                    base_url=s.get("base_url", ""),
                    api_key_enc=encrypt(s.get("api_key", "")),
                    is_active=s.get("is_active", True),
                )
                db.add(svc)
                imported["services"] += 1

        # ── Mappings ──
        for m in data.get("mappings", []):
            user_id = resolve_user_id(m.get("user_id"))
            if not user_id:
                continue
            result = await db.execute(
                select(UserServiceMapping).where(UserServiceMapping.user_id == user_id, UserServiceMapping.service_type == m["service_type"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                existing.service_username = m["service_username"]
            else:
                db.add(UserServiceMapping(user_id=user_id, service_type=m["service_type"], service_username=m["service_username"]))
                imported["mappings"] += 1

        # ── Global config ──
        for key, value in data.get("config", {}).items():
            result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == key))
            existing = result.scalar_one_or_none()
            if existing:
                existing.value = value
            else:
                db.add(GlobalConfig(key=key, value=value))
            imported["config"] += 1

        # ── Custom themes ──
        for t in data.get("themes", []):
            result = await db.execute(select(ThemePack).where(ThemePack.slug == t["slug"]))
            existing = result.scalar_one_or_none()
            if existing and not existing.is_builtin:
                existing.name = t.get("name", existing.name)
                existing.config = t.get("config", existing.config)
            elif not existing:
                db.add(ThemePack(name=t["name"], slug=t["slug"], is_builtin=False, config=t.get("config", {})))
                imported["themes"] += 1

        # ── OIDC providers ──
        for p in data.get("oidc_providers", []):
            result = await db.execute(select(OIDCProvider).where(OIDCProvider.name == p["name"]))
            existing = result.scalar_one_or_none()
            if existing:
                existing.issuer_url = p.get("issuer_url", existing.issuer_url)
                existing.client_id = p.get("client_id", existing.client_id)
                if p.get("client_secret"):
                    existing.client_secret = encrypt(p["client_secret"])
                existing.scopes = p.get("scopes", existing.scopes)
                existing.is_active = p.get("is_active", True)
            else:
                db.add(OIDCProvider(
                    name=p["name"],
                    issuer_url=p.get("issuer_url", ""),
                    client_id=p.get("client_id", ""),
                    client_secret=encrypt(p.get("client_secret", "")),
                    scopes=p.get("scopes", "openid profile email"),
                    is_active=p.get("is_active", True),
                ))
                imported["oidc"] += 1

        # ── Phrases ──
        for p in data.get("phrases", []):
            user_id = resolve_user_id(p.get("user_id"))
            if not user_id:
                continue
            db.add(CustomPhrase(
                user_id=user_id,
                category=p.get("category", ""),
                text=p.get("text", ""),
                sort_order=p.get("sort_order", 0),
                mode=p.get("mode", "mix"),
            ))
            imported["phrases"] += 1

        await db.commit()

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Import failed")
        raise HTTPException(status_code=500, detail=f"Erreur d'import: {e}")

    return {"status": "ok", "imported": imported}


@router.post("/import-setup")
async def import_setup(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Import configuration during setup (no auth required, only if no users exist)."""
    from app.api.v1.setup import _is_setup_needed

    if not await _is_setup_needed(db):
        raise HTTPException(status_code=403, detail="Setup deja termine. Utilisez /backup/import avec authentification admin.")

    # Reuse import logic but without admin auth
    import json
    try:
        content = await file.read()
        data = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fichier JSON invalide: {e}")

    if not data.get("_wrapparr_backup"):
        raise HTTPException(status_code=400, detail="Ce fichier n'est pas un backup Wrapparr")

    # Create users with hashed passwords reset (they'll need to set new passwords)
    for u in data.get("users", []):
        user = User(
            email=u["email"],
            display_name=u.get("display_name", u["email"]),
            role=u.get("role", "user"),
            is_active=u.get("is_active", True),
            allow_comparison=u.get("allow_comparison", True),
            hashed_password=None,
        )
        db.add(user)
        await db.flush()

        # Services for this user
        for s in data.get("services", []):
            if s.get("user_id") == u.get("id"):
                db.add(ServiceConnector(
                    user_id=user.id,
                    service_type=s["service_type"],
                    display_name=s.get("display_name", s["service_type"]),
                    base_url=s.get("base_url", ""),
                    api_key_enc=encrypt(s.get("api_key", "")),
                    is_active=s.get("is_active", True),
                ))

        # Mappings for this user
        for m in data.get("mappings", []):
            if m.get("user_id") == u.get("id"):
                db.add(UserServiceMapping(user_id=user.id, service_type=m["service_type"], service_username=m["service_username"]))

    # Global config
    for key, value in data.get("config", {}).items():
        result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == key))
        if not result.scalar_one_or_none():
            db.add(GlobalConfig(key=key, value=value))

    # Custom themes
    for t in data.get("themes", []):
        result = await db.execute(select(ThemePack).where(ThemePack.slug == t["slug"]))
        if not result.scalar_one_or_none():
            db.add(ThemePack(name=t["name"], slug=t["slug"], is_builtin=False, config=t.get("config", {})))

    # OIDC
    for p in data.get("oidc_providers", []):
        result = await db.execute(select(OIDCProvider).where(OIDCProvider.name == p["name"]))
        if not result.scalar_one_or_none():
            db.add(OIDCProvider(
                name=p["name"], issuer_url=p.get("issuer_url", ""), client_id=p.get("client_id", ""),
                client_secret=encrypt(p.get("client_secret", "")), scopes=p.get("scopes", "openid profile email"),
                is_active=p.get("is_active", True),
            ))

    await db.commit()

    return {"status": "ok", "message": "Configuration importee. Les mots de passe des utilisateurs doivent etre redefinis."}
