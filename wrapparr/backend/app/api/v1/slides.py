from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.slide import SlideConfig
from app.models.user import User
from app.schemas.slide import SlideConfigItem, SlideConfigUpdate

router = APIRouter(prefix="/slides", tags=["slides"])


@router.get("/config", response_model=list[SlideConfigItem])
async def get_slide_config(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SlideConfig).where(SlideConfig.user_id == user.id).order_by(SlideConfig.sort_order)
    )
    return [SlideConfigItem.model_validate(s) for s in result.scalars().all()]


@router.put("/config", response_model=list[SlideConfigItem])
async def update_slide_config(
    data: SlideConfigUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    # Validate: intro must be first, finale must be last
    for item in data.slides:
        if item.slide_id == "intro" and item.sort_order != 0:
            raise HTTPException(status_code=422, detail="La slide intro doit rester en première position")
        if item.slide_id == "finale":
            max_order = max(s.sort_order for s in data.slides)
            if item.sort_order != max_order:
                raise HTTPException(status_code=422, detail="La slide finale doit rester en dernière position")

    # Replace all configs
    await db.execute(delete(SlideConfig).where(SlideConfig.user_id == user.id))
    configs = []
    for item in data.slides:
        cfg = SlideConfig(user_id=user.id, slide_id=item.slide_id, enabled=item.enabled, sort_order=item.sort_order)
        db.add(cfg)
        configs.append(cfg)

    await db.commit()
    return [SlideConfigItem.model_validate(c) for c in configs]
