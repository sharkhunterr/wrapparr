import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.auth import RefreshToken
from app.models.user import User


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def register_user(db: AsyncSession, email: str, password: str, display_name: str) -> tuple[User, str, str]:
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise ValueError("Cet email est déjà utilisé")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        display_name=display_name,
        role="user",
    )
    db.add(user)
    await db.flush()

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(rt)
    await db.commit()
    await db.refresh(user)

    return user, access, refresh


async def authenticate_user(db: AsyncSession, email: str, password: str) -> tuple[User, str, str]:
    result = await db.execute(select(User).where(User.email == email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        raise ValueError("Email ou mot de passe incorrect")

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(rt)
    await db.commit()

    return user, access, refresh


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> str:
    token_hash = _hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken)
        .where(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
    )
    rt = result.scalar_one_or_none()
    if not rt or rt.expires_at < datetime.now(timezone.utc):
        raise ValueError("Token de rafraîchissement invalide ou expiré")

    result = await db.execute(select(User).where(User.id == rt.user_id, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("Utilisateur introuvable")

    return create_access_token(str(user.id), user.role)


async def issue_tokens_for_user(db: AsyncSession, user: User) -> tuple[str, str]:
    """Issue access + refresh tokens for an existing user (used by SSO callback)."""
    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_token(refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(rt)
    await db.commit()

    return access, refresh


async def revoke_refresh_token(db: AsyncSession, refresh_token: str) -> None:
    token_hash = _hash_token(refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    rt = result.scalar_one_or_none()
    if rt:
        rt.revoked = True
        await db.commit()
