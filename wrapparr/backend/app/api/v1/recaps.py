import asyncio
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session, get_db
from app.core.security import get_current_user
from app.models.recap import YearlyRecap
from app.models.user import User
from app.schemas.recap import (
    CompareResponse,
    GenerateRequest,
    ProgressResponse,
    RecapDetail,
    RecapListItem,
)
from app.services.pipeline import RecapPipeline
from app.services.recap_service import get_compare_data, get_recap, get_recaps, get_snapshot

router = APIRouter(prefix="/recaps", tags=["recaps"])


async def _run_pipeline(user_id, year: int):
    async with async_session() as db:
        pipeline = RecapPipeline(db)
        await pipeline.run(user_id, year)


@router.get("/slide-config")
async def get_slide_config_public(_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get slide settings + order (readable by any authenticated user)."""
    from app.models.share import GlobalConfig
    result = await db.execute(select(GlobalConfig).where(GlobalConfig.key == "slide_settings"))
    cfg = result.scalar_one_or_none()
    result2 = await db.execute(select(GlobalConfig).where(GlobalConfig.key == "slide_order"))
    order_cfg = result2.scalar_one_or_none()
    result3 = await db.execute(select(GlobalConfig).where(GlobalConfig.key == "active_theme"))
    theme_cfg = result3.scalar_one_or_none()
    # Public recap settings
    public_keys = ["comparison_default_on", "recap_music"]
    public_config = {}
    for pk in public_keys:
        r = await db.execute(select(GlobalConfig).where(GlobalConfig.key == pk))
        gc = r.scalar_one_or_none()
        if gc is not None:
            public_config[pk] = gc.value

    return {
        "settings": cfg.value if cfg else {},
        "order": order_cfg.value if order_cfg else [],
        "active_theme": theme_cfg.value if theme_cfg else None,
        "recap_config": public_config,
    }


@router.get("", response_model=list[RecapListItem])
async def list_recaps(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Show user's own recaps + any active/completed recaps
    own = await get_recaps(db, user.id)
    own_ids = {r.id for r in own}
    result = await db.execute(
        select(YearlyRecap).where(YearlyRecap.status == "completed").order_by(YearlyRecap.year.desc())
    )
    all_recaps = list(own)
    for r in result.scalars().all():
        if r.id not in own_ids:
            all_recaps.append(r)
    return [RecapListItem.model_validate(r) for r in all_recaps]


@router.get("/active")
async def get_active_recap(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Get the currently active recap for this user (within diffusion period)."""
    from sqlalchemy import and_
    now = datetime.now()
    # Active recaps are shared — any user can see any active recap
    result = await db.execute(
        select(YearlyRecap).where(
            YearlyRecap.is_active.is_(True),
            YearlyRecap.status == "completed",
        ).order_by(YearlyRecap.year.desc())
    )
    for recap in result.scalars().all():
        # Check diffusion period
        if recap.available_from and recap.available_from > now:
            continue
        if recap.available_until and recap.available_until < now:
            continue
        return {
            "year": recap.year,
            "status": recap.status,
            "data": recap.data,
            "slide_settings": recap.slide_settings,
        }
    return None


@router.get("/compare", response_model=CompareResponse)
async def compare_recaps(
    years: str = Query(..., description="Années séparées par des virgules, ex: 2024,2023"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    year_list = [int(y.strip()) for y in years.split(",")]
    data = await get_compare_data(db, user.id, year_list)
    return CompareResponse(years=data)


@router.get("/{year}", response_model=RecapDetail)
async def get_recap_detail(year: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Try user's own recap first, then any active recap for that year
    recap = await get_recap(db, user.id, year)
    if not recap:
        result = await db.execute(
            select(YearlyRecap).where(YearlyRecap.year == year, YearlyRecap.status == "completed")
        )
        recap = result.scalar_one_or_none()
    if not recap:
        raise HTTPException(status_code=404, detail="Aucun recap pour cette année")

    snapshot = await get_snapshot(db, recap.user_id, year)
    return RecapDetail(
        year=recap.year,
        status=recap.status,
        data=recap.data,
        slide_config=snapshot.slide_config if snapshot else None,
        theme_pack=snapshot.theme_pack if snapshot else None,
    )


@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def generate_recap(
    data: GenerateRequest,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    year = data.year or datetime.now().year

    existing = await get_recap(db, user.id, year)
    if existing and existing.status in ("collecting", "processing", "fetching_posters"):
        raise HTTPException(status_code=409, detail="Generation deja en cours")

    # Reset status if re-generating
    if existing:
        existing.status = "pending"
        existing.progress = 0
        existing.progress_msg = None
        await db.commit()

    background_tasks.add_task(_run_pipeline, user.id, year)
    return {"recap_id": str(existing.id) if existing else "new", "status": "pending"}


@router.get("/{year}/progress", response_model=ProgressResponse)
async def get_progress(year: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    recap = await get_recap(db, user.id, year)
    if not recap:
        raise HTTPException(status_code=404, detail="Aucun recap pour cette année")
    return ProgressResponse(status=recap.status, progress=recap.progress, progress_msg=recap.progress_msg)
