import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.analytics import RecapViewSession, RecapReaction
from app.models.user import User
from app.core.utils import to_uuid

router = APIRouter(prefix="/analytics", tags=["analytics"])


# ── Schemas ──

class SlideDataEntry(BaseModel):
    slideId: str
    timeSpent: float = 0
    interacted: bool = False

class InteractionData(BaseModel):
    slideId: str
    slideType: str = ""
    score: int | None = None
    total: int | None = None
    answers: list | None = None

class SessionCreate(BaseModel):
    year: int
    duration_seconds: float = 0
    total_slides: int = 0
    slides_viewed: int = 0
    theme_id: str | None = None
    palette_slug: str | None = None
    music_enabled: bool = False
    comparison_enabled: bool = False
    slide_data: list[SlideDataEntry] | None = None
    interactions: list[InteractionData] | None = None
    device: str | None = None

class ReactionCreate(BaseModel):
    session_id: str
    year: int
    slide_id: str
    reaction_type: str  # "emoji", "comment", "like"
    value: str


# ── User endpoints ──

@router.post("/sessions")
async def create_session(
    data: SessionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a viewing session when user finishes/leaves the recap."""
    slide_dict = [s.model_dump() for s in data.slide_data] if data.slide_data else []
    interactions_dict = {i.slideId: i.model_dump() for i in data.interactions} if data.interactions else {}

    session = RecapViewSession(
        user_id=user.id,
        user_name=user.display_name,
        year=data.year,
        started_at=datetime.now(timezone.utc),
        ended_at=datetime.now(timezone.utc),
        duration_seconds=data.duration_seconds,
        total_slides=data.total_slides,
        slides_viewed=data.slides_viewed,
        theme_id=data.theme_id,
        palette_slug=data.palette_slug,
        music_enabled=data.music_enabled,
        comparison_enabled=data.comparison_enabled,
        slide_data=slide_dict,
        interactions=interactions_dict,
        reactions=[],
        device=data.device,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"id": str(session.id), "status": "ok"}


@router.post("/sessions/beacon")
async def create_session_beacon(
    request: Request,
    _token: str = Query(default=""),
    db: AsyncSession = Depends(get_db),
):
    """Receive telemetry via sendBeacon (no Authorization header, token in query)."""
    if not _token:
        raise HTTPException(status_code=401, detail="Token required")

    from jose import jwt, JWTError
    from app.core.config import settings
    try:
        payload = jwt.decode(_token, settings.secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401)

    result = await db.execute(select(User).where(User.id == to_uuid(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401)

    import json
    body = await request.body()
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    session = RecapViewSession(
        user_id=user.id,
        user_name=user.display_name,
        year=data.get("year", 0),
        started_at=datetime.now(timezone.utc),
        ended_at=datetime.now(timezone.utc),
        duration_seconds=data.get("duration_seconds", 0),
        total_slides=data.get("total_slides", 0),
        slides_viewed=data.get("slides_viewed", 0),
        theme_id=data.get("theme_id"),
        palette_slug=data.get("palette_slug"),
        music_enabled=data.get("music_enabled", False),
        comparison_enabled=data.get("comparison_enabled", False),
        slide_data=data.get("slide_data", []),
        interactions=data.get("interactions", {}),
        reactions=[],
        device=data.get("device"),
    )
    db.add(session)
    await db.commit()
    return {"status": "ok"}


@router.post("/reactions")
async def add_reaction(
    data: ReactionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a reaction/comment to a slide."""
    reaction = RecapReaction(
        session_id=to_uuid(data.session_id),
        user_id=user.id,
        user_name=user.display_name,
        year=data.year,
        slide_id=data.slide_id,
        reaction_type=data.reaction_type,
        value=data.value,
    )
    db.add(reaction)
    await db.commit()
    return {"status": "ok"}


# ── Admin endpoints ──

@router.get("/admin/summary")
async def get_summary(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Global analytics summary for admin dashboard."""
    # Total sessions
    total_q = await db.execute(select(func.count(RecapViewSession.id)))
    total_sessions = total_q.scalar() or 0

    # Unique viewers
    viewers_q = await db.execute(select(func.count(func.distinct(RecapViewSession.user_id))))
    unique_viewers = viewers_q.scalar() or 0

    # Avg duration
    avg_q = await db.execute(select(func.avg(RecapViewSession.duration_seconds)))
    avg_duration = round(avg_q.scalar() or 0, 1)

    # Avg slides viewed
    avg_slides_q = await db.execute(select(func.avg(RecapViewSession.slides_viewed)))
    avg_slides = round(avg_slides_q.scalar() or 0, 1)

    # Total reactions
    reactions_q = await db.execute(select(func.count(RecapReaction.id)))
    total_reactions = reactions_q.scalar() or 0

    # Sessions per user
    per_user_q = await db.execute(
        select(
            RecapViewSession.user_name,
            RecapViewSession.user_id,
            func.count(RecapViewSession.id).label("sessions"),
            func.sum(RecapViewSession.duration_seconds).label("total_time"),
            func.avg(RecapViewSession.duration_seconds).label("avg_time"),
            func.avg(RecapViewSession.slides_viewed).label("avg_slides"),
        )
        .group_by(RecapViewSession.user_id, RecapViewSession.user_name)
        .order_by(desc("sessions"))
    )
    users = []
    for row in per_user_q.all():
        users.append({
            "name": row.user_name,
            "user_id": str(row.user_id),
            "sessions": row.sessions,
            "total_time": round(row.total_time or 0, 1),
            "avg_time": round(row.avg_time or 0, 1),
            "avg_slides": round(row.avg_slides or 0, 1),
        })

    # Theme popularity
    theme_q = await db.execute(
        select(RecapViewSession.theme_id, func.count(RecapViewSession.id).label("cnt"))
        .where(RecapViewSession.theme_id.isnot(None))
        .group_by(RecapViewSession.theme_id)
        .order_by(desc("cnt"))
    )
    themes = [{"theme": r.theme_id, "count": r.cnt} for r in theme_q.all()]

    # Music / comparison usage
    music_q = await db.execute(
        select(func.count(RecapViewSession.id)).where(RecapViewSession.music_enabled == True)
    )
    comparison_q = await db.execute(
        select(func.count(RecapViewSession.id)).where(RecapViewSession.comparison_enabled == True)
    )

    return {
        "total_sessions": total_sessions,
        "unique_viewers": unique_viewers,
        "avg_duration": avg_duration,
        "avg_slides_viewed": avg_slides,
        "total_reactions": total_reactions,
        "users": users,
        "themes": themes,
        "music_usage": music_q.scalar() or 0,
        "comparison_usage": comparison_q.scalar() or 0,
    }


@router.get("/admin/sessions")
async def get_sessions(
    user_id: str | None = None,
    year: int | None = None,
    limit: int = 50,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List viewing sessions with optional filters."""
    q = select(RecapViewSession).order_by(desc(RecapViewSession.started_at))
    if user_id:
        q = q.where(RecapViewSession.user_id == to_uuid(user_id))
    if year:
        q = q.where(RecapViewSession.year == year)
    q = q.limit(limit)

    result = await db.execute(q)
    sessions = []
    for s in result.scalars().all():
        sessions.append({
            "id": str(s.id),
            "user_name": s.user_name,
            "user_id": str(s.user_id),
            "year": s.year,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "duration_seconds": s.duration_seconds,
            "total_slides": s.total_slides,
            "slides_viewed": s.slides_viewed,
            "theme_id": s.theme_id,
            "palette_slug": s.palette_slug,
            "music_enabled": s.music_enabled,
            "comparison_enabled": s.comparison_enabled,
            "slide_data": s.slide_data,
            "interactions": s.interactions,
            "reactions": s.reactions,
            "device": s.device,
        })
    return sessions


@router.get("/admin/slide-stats")
async def get_slide_stats(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Aggregate per-slide statistics across all sessions."""
    result = await db.execute(select(RecapViewSession.slide_data).where(RecapViewSession.slide_data.isnot(None)))

    slide_agg = {}  # {slideId: {total_time, view_count, interaction_count}}
    for row in result.scalars().all():
        if not row:
            continue
        for entry in row:
            sid = entry.get("slideId", "")
            if not sid:
                continue
            if sid not in slide_agg:
                slide_agg[sid] = {"total_time": 0, "view_count": 0, "interaction_count": 0}
            slide_agg[sid]["total_time"] += entry.get("timeSpent", 0)
            slide_agg[sid]["view_count"] += 1
            if entry.get("interacted"):
                slide_agg[sid]["interaction_count"] += 1

    slides = []
    for sid, agg in sorted(slide_agg.items(), key=lambda x: -x[1]["total_time"]):
        slides.append({
            "slide_id": sid,
            "avg_time": round(agg["total_time"] / agg["view_count"], 1) if agg["view_count"] > 0 else 0,
            "total_time": round(agg["total_time"], 1),
            "view_count": agg["view_count"],
            "interaction_count": agg["interaction_count"],
        })
    return slides


@router.get("/admin/interactions")
async def get_interactions(_admin=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    """Aggregate interactive slide results."""
    result = await db.execute(
        select(RecapViewSession.user_name, RecapViewSession.interactions)
        .where(RecapViewSession.interactions.isnot(None))
    )

    all_interactions = []
    for row in result.all():
        user_name = row.user_name
        interactions = row.interactions or {}
        for slide_id, data in interactions.items():
            all_interactions.append({
                "user_name": user_name,
                "slide_id": slide_id,
                "slide_type": data.get("slideType", ""),
                "score": data.get("score"),
                "total": data.get("total"),
                "answers": data.get("answers"),
            })
    return all_interactions


@router.get("/admin/reactions")
async def get_reactions(
    year: int | None = None,
    slide_id: str | None = None,
    _admin=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all reactions/comments."""
    q = select(RecapReaction).order_by(desc(RecapReaction.created_at))
    if year:
        q = q.where(RecapReaction.year == year)
    if slide_id:
        q = q.where(RecapReaction.slide_id == slide_id)
    q = q.limit(200)

    result = await db.execute(q)
    return [{
        "id": str(r.id),
        "user_name": r.user_name,
        "year": r.year,
        "slide_id": r.slide_id,
        "reaction_type": r.reaction_type,
        "value": r.value,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in result.scalars().all()]
