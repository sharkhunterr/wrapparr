import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.collectors.audiobookshelf import AudiobookshelfCollector
from app.collectors.booklore import BookloreCollector
from app.collectors.jellyfin import JellyfinCollector
from app.collectors.komga import KomgaCollector
from app.collectors.romm import ROMMCollector
from app.collectors.tautulli import TautulliCollector
from app.core.database import get_db
from app.core.encryption import decrypt, encrypt
from app.core.security import get_current_user
from app.models.service import ServiceConnector
from app.models.user import User
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate, TestConnectionResponse

router = APIRouter(prefix="/services", tags=["services"])

COLLECTOR_MAP = {
    "tautulli": TautulliCollector,
    "jellyfin": JellyfinCollector,
    "romm": ROMMCollector,
    "audiobookshelf": AudiobookshelfCollector,
    "komga": KomgaCollector,
    "booklore": BookloreCollector,
}


def _get_collector(svc: ServiceConnector):
    cls = COLLECTOR_MAP.get(svc.service_type)
    if not cls:
        raise HTTPException(status_code=400, detail=f"Type de service inconnu: {svc.service_type}")
    return cls(base_url=svc.base_url, api_key=decrypt(svc.api_key_enc))


@router.get("", response_model=list[ServiceResponse])
async def list_services(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ServiceConnector).where(ServiceConnector.user_id == user.id))
    services = []
    for s in result.scalars().all():
        resp = ServiceResponse.model_validate(s)
        resp.api_key_clear = decrypt(s.api_key_enc)
        services.append(resp)
    return services


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(data: ServiceCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check duplicate
    existing = await db.execute(
        select(ServiceConnector).where(
            ServiceConnector.user_id == user.id,
            ServiceConnector.service_type == data.service_type,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Un connecteur {data.service_type} existe deja")

    svc = ServiceConnector(
        user_id=user.id,
        service_type=data.service_type,
        display_name=data.display_name,
        base_url=data.base_url,
        api_key_enc=encrypt(data.api_key),
    )
    db.add(svc)
    await db.commit()
    await db.refresh(svc)
    resp = ServiceResponse.model_validate(svc)
    resp.api_key_clear = decrypt(svc.api_key_enc)
    return resp


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: uuid.UUID, data: ServiceUpdate,
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceConnector).where(ServiceConnector.id == service_id, ServiceConnector.user_id == user.id)
    )
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service introuvable")

    if data.display_name is not None:
        svc.display_name = data.display_name
    if data.base_url is not None:
        svc.base_url = data.base_url
    if data.api_key is not None:
        svc.api_key_enc = encrypt(data.api_key)
    if data.is_active is not None:
        svc.is_active = data.is_active

    await db.commit()
    await db.refresh(svc)
    resp = ServiceResponse.model_validate(svc)
    resp.api_key_clear = decrypt(svc.api_key_enc)
    return resp


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceConnector).where(ServiceConnector.id == service_id, ServiceConnector.user_id == user.id)
    )
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service introuvable")
    await db.delete(svc)
    await db.commit()


@router.post("/{service_id}/test", response_model=TestConnectionResponse)
async def test_connection(
    service_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ServiceConnector).where(ServiceConnector.id == service_id, ServiceConnector.user_id == user.id)
    )
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service introuvable")

    # Special handling for TMDB — not a collector, just an API key test
    if svc.service_type == "tmdb":
        import httpx
        api_key = decrypt(svc.api_key_enc)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get("https://api.themoviedb.org/3/configuration", params={"api_key": api_key})
                if resp.status_code == 200:
                    ok, msg = True, "Connexion TMDB reussie"
                elif resp.status_code == 401:
                    ok, msg = False, "Cle API TMDB invalide"
                else:
                    ok, msg = False, f"Erreur TMDB: {resp.status_code}"
        except Exception as e:
            ok, msg = False, str(e)
    else:
        collector = _get_collector(svc)
        try:
            ok, msg = await collector.test_connection()
        finally:
            await collector.close()

    svc.last_test_at = datetime.now(timezone.utc)
    svc.last_test_ok = ok
    await db.commit()

    if ok:
        return TestConnectionResponse(ok=True, details=msg)
    return TestConnectionResponse(ok=False, error=msg)
