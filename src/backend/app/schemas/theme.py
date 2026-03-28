import uuid
from typing import Any

from pydantic import BaseModel


class ThemePackResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    is_builtin: bool
    config: dict[str, Any]

    model_config = {"from_attributes": True}


class ThemePackCreate(BaseModel):
    name: str
    config: dict[str, Any]


class ThemePackUpdate(BaseModel):
    name: str | None = None
    config: dict[str, Any] | None = None


class UserThemeUpdate(BaseModel):
    theme_pack_id: uuid.UUID
    overrides: dict[str, Any] | None = None
