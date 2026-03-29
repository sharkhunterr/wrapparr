import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class YearlyRecap(Base):
    __tablename__ = "yearly_recaps"
    __table_args__ = (UniqueConstraint("user_id", "year", name="uq_user_year"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "collecting", "processing", "fetching_posters", "completed", "failed", name="recap_status"),
        default="pending",
    )
    progress: Mapped[int] = mapped_column(Integer, default=0)
    progress_msg: Mapped[str | None] = mapped_column(String(255), nullable=True)
    data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Diffusion
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    available_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    available_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Slide config per recap
    slide_settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class HistorySnapshot(Base):
    __tablename__ = "history_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    recap_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("yearly_recaps.id"), unique=True)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id"), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    recap_data: Mapped[dict] = mapped_column(JSON, nullable=False)
    slide_config: Mapped[dict] = mapped_column(JSON, nullable=False)
    theme_pack: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
