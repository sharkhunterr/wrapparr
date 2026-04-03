import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class RecapViewSession(Base):
    """One viewing session of a recap by a user."""
    __tablename__ = "recap_view_sessions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0)
    total_slides: Mapped[int] = mapped_column(Integer, default=0)
    slides_viewed: Mapped[int] = mapped_column(Integer, default=0)

    # Settings used during this session
    theme_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    palette_slug: Mapped[str | None] = mapped_column(String(50), nullable=True)
    music_enabled: Mapped[bool] = mapped_column(default=False)
    comparison_enabled: Mapped[bool] = mapped_column(default=False)

    # Per-slide telemetry: [{slideId, timeSpent, interacted, ...}]
    slide_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Interactive slide responses: {slideId: {score, answers, ...}}
    interactions: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Reactions & comments (for future use): [{slideId, type, value, ...}]
    reactions: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # User agent / device info
    device: Mapped[str | None] = mapped_column(String(200), nullable=True)


class RecapReaction(Base):
    """Individual reaction or comment on a slide."""
    __tablename__ = "recap_reactions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    slide_id: Mapped[str] = mapped_column(String(100), nullable=False)
    reaction_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "emoji", "comment", "like"
    value: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
