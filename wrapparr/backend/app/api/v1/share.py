import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.recap import YearlyRecap
from app.models.share import GlobalConfig, ShareLink
from app.models.user import User
from app.schemas.share import ShareCreate, ShareResponse, SharedRecapResponse

router = APIRouter(prefix="/share", tags=["share"])


async def _get_config_value(db: AsyncSession, key: str, default=None):
    result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == key))
    cfg = result.scalar_one_or_none()
    return cfg.value if cfg else default


@router.post("", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
async def create_share(
    data: ShareCreate, request: Request,
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    # Verify recap exists and belongs to user
    result = await db.execute(
        select(YearlyRecap).where(YearlyRecap.id == data.recap_id, YearlyRecap.user_id == user.id)
    )
    recap = result.scalar_one_or_none()
    if not recap:
        raise HTTPException(status_code=404, detail="Recap introuvable")

    expiry_days = await _get_config_value(db, "public_share_expiry_days", 30)
    token = secrets.token_urlsafe(32)

    link = ShareLink(
        user_id=user.id,
        recap_id=data.recap_id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=expiry_days),
    )
    db.add(link)
    await db.commit()

    base_url = str(request.base_url).rstrip("/")
    return ShareResponse(token=token, url=f"{base_url}/share/{token}", expires_at=link.expires_at)


@router.delete("/{token}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_share(token: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ShareLink).where(ShareLink.token == token, ShareLink.user_id == user.id)
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Lien introuvable")
    await db.delete(link)
    await db.commit()


@router.get("/{token}", response_model=SharedRecapResponse)
async def get_shared_recap(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ShareLink).where(ShareLink.token == token))
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Lien introuvable")

    if link.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="Ce lien de partage a expiré")

    result = await db.execute(select(YearlyRecap).where(YearlyRecap.id == link.recap_id))
    recap = result.scalar_one_or_none()
    if not recap or not recap.data:
        raise HTTPException(status_code=404, detail="Recap introuvable")

    # Filter sensitive data: remove ranking, personal info
    filtered = {k: v for k, v in recap.data.items()}
    for svc_data in filtered.values():
        if isinstance(svc_data, dict):
            svc_data.pop("ranking", None)
    filtered.pop("global", None)

    return SharedRecapResponse(year=recap.year, data=filtered)
