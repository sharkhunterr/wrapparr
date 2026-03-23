import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.theme import ThemePack
from app.models.user import User
from app.schemas.theme import ThemePackCreate, ThemePackResponse, ThemePackUpdate, UserThemeUpdate

router = APIRouter(prefix="/themes", tags=["themes"])


@router.get("", response_model=list[ThemePackResponse])
async def list_themes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThemePack).order_by(ThemePack.name))
    return [ThemePackResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/{slug}", response_model=ThemePackResponse)
async def get_theme(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThemePack).where(ThemePack.slug == slug))
    theme = result.scalar_one_or_none()
    if not theme:
        raise HTTPException(status_code=404, detail="Thème introuvable")
    return ThemePackResponse.model_validate(theme)


@router.put("/users/me/theme")
async def set_user_theme(data: UserThemeUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Check theme exists
    result = await db.execute(select(ThemePack).where(ThemePack.id == data.theme_pack_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Thème introuvable")
    user.theme_pack_id = data.theme_pack_id
    await db.commit()
    return {"status": "ok"}


@router.post("/admin/themes", response_model=ThemePackResponse, status_code=status.HTTP_201_CREATED)
async def create_theme(data: ThemePackCreate, _admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    slug = data.name.lower().replace(" ", "-")
    theme = ThemePack(name=data.name, slug=slug, is_builtin=False, config=data.config)
    db.add(theme)
    await db.commit()
    await db.refresh(theme)
    return ThemePackResponse.model_validate(theme)


@router.put("/admin/themes/{theme_id}", response_model=ThemePackResponse)
async def update_theme(
    theme_id: uuid.UUID, data: ThemePackUpdate, _admin=Depends(require_admin), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ThemePack).where(ThemePack.id == theme_id))
    theme = result.scalar_one_or_none()
    if not theme:
        raise HTTPException(status_code=404, detail="Thème introuvable")
    if data.name is not None:
        theme.name = data.name
        theme.slug = data.name.lower().replace(" ", "-")
    if data.config is not None:
        theme.config = data.config
    await db.commit()
    await db.refresh(theme)
    return ThemePackResponse.model_validate(theme)


@router.delete("/admin/themes/{theme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_theme(theme_id: uuid.UUID, _admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThemePack).where(ThemePack.id == theme_id))
    theme = result.scalar_one_or_none()
    if not theme:
        raise HTTPException(status_code=404, detail="Thème introuvable")
    if theme.is_builtin:
        raise HTTPException(status_code=403, detail="Impossible de supprimer un thème intégré")
    await db.delete(theme)
    await db.commit()
