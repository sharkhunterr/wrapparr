import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class RecapListItem(BaseModel):
    id: uuid.UUID
    year: int
    status: str
    progress: int
    is_active: bool = False
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class RecapDetail(BaseModel):
    year: int
    status: str
    data: dict[str, Any] | None = None
    slide_config: dict[str, Any] | list[dict[str, Any]] | None = None
    theme_pack: dict[str, Any] | None = None

    model_config = {"from_attributes": True}


class GenerateRequest(BaseModel):
    year: int | None = None


class ProgressResponse(BaseModel):
    status: str
    progress: int
    progress_msg: str | None = None


class CompareResponse(BaseModel):
    years: list[dict[str, Any]]
