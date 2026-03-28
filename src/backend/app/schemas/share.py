import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class ShareCreate(BaseModel):
    recap_id: uuid.UUID


class ShareResponse(BaseModel):
    token: str
    url: str
    expires_at: datetime


class SharedRecapResponse(BaseModel):
    year: int
    data: dict[str, Any]
    theme_pack: dict[str, Any] | None = None
