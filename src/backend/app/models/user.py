import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(Enum("admin", "user", "viewer", name="user_role"), default="user")
    oidc_provider_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("oidc_providers.id"), nullable=True
    )
    oidc_sub: Mapped[str | None] = mapped_column(String(255), nullable=True)
    allow_comparison: Mapped[bool] = mapped_column(Boolean, default=True)
    theme_pack_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("theme_packs.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
