import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.phrase import CustomPhrase
from app.models.user import User
from app.schemas.phrase import PhraseCreate, PhraseResponse, PhraseUpdate
from app.core.utils import to_uuid

router = APIRouter(prefix="/phrases", tags=["phrases"])

DEFAULT_JOKES = {
    "films": [
        "{user} a regardé {count} films cette année...",
        "Soit l'équivalent de {hours}h sans dormir.",
        "Il a ri, pleuré, et probablement mangé des chips.",
        "Voici son podium officiel {year} 🎬",
    ],
    "series": [
        "{count} épisodes. En une seule année.",
        "C'est des binges complets.",
        "Sa série préférée ? Il a failli spoiler tout le monde.",
        "Le verdict tombe maintenant 🎭",
    ],
    "romm": [
        "{count} jeux. {hours} heures. Des doigts endoloris.",
        "Sa session la plus longue : épique.",
        "Les voisins ont entendu les victoires.",
        "Voici le top du gamepad 🎮",
    ],
    "audio": [
        "{count} livres audio en {year}.",
        "Principalement en mode sci-fi hardcore.",
        "Son cerveau a voyagé dans des univers différents.",
        "Le palmarès littéraire s'affiche 🎧",
    ],
    "komga": [
        "{count} volumes de manga lus cette année.",
        "Soit plusieurs volumes par mois. Respect.",
        "Il a pleuré sur au moins 4 arcs scénaristiques.",
        "Le podium des cases s'illumine 📚",
    ],
}


@router.get("/defaults")
async def get_default_phrases():
    return DEFAULT_JOKES


@router.get("", response_model=list[PhraseResponse])
async def list_phrases(
    category: str | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(CustomPhrase).where(CustomPhrase.user_id == user.id)
    if category:
        query = query.where(CustomPhrase.category == category)
    query = query.order_by(CustomPhrase.sort_order)
    result = await db.execute(query)
    return [PhraseResponse.model_validate(p) for p in result.scalars().all()]


@router.post("", response_model=PhraseResponse, status_code=status.HTTP_201_CREATED)
async def create_phrase(data: PhraseCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    phrase = CustomPhrase(
        user_id=user.id, category=data.category, text=data.text, sort_order=data.sort_order, mode=data.mode,
    )
    db.add(phrase)
    await db.commit()
    await db.refresh(phrase)
    return PhraseResponse.model_validate(phrase)


@router.put("/{phrase_id}", response_model=PhraseResponse)
async def update_phrase(
    phrase_id: uuid.UUID, data: PhraseUpdate,
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomPhrase).where(CustomPhrase.id == to_uuid(phrase_id), CustomPhrase.user_id == user.id)
    )
    phrase = result.scalar_one_or_none()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase introuvable")

    if data.text is not None:
        phrase.text = data.text
    if data.sort_order is not None:
        phrase.sort_order = data.sort_order
    if data.mode is not None:
        phrase.mode = data.mode

    await db.commit()
    await db.refresh(phrase)
    return PhraseResponse.model_validate(phrase)


@router.delete("/{phrase_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_phrase(
    phrase_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CustomPhrase).where(CustomPhrase.id == to_uuid(phrase_id), CustomPhrase.user_id == user.id)
    )
    phrase = result.scalar_one_or_none()
    if not phrase:
        raise HTTPException(status_code=404, detail="Phrase introuvable")
    await db.delete(phrase)
    await db.commit()
