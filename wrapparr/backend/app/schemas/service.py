import uuid
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class ServiceCreate(BaseModel):
    service_type: str
    display_name: str
    base_url: str
    api_key: str


class ServiceUpdate(BaseModel):
    display_name: str | None = None
    base_url: str | None = None
    api_key: str | None = None
    is_active: bool | None = None


class ServiceResponse(BaseModel):
    id: uuid.UUID
    service_type: str
    display_name: str
    base_url: str
    is_active: bool
    last_test_ok: bool | None = None
    last_test_at: datetime | None = None
    api_key_clear: str | None = None

    model_config = {"from_attributes": True}


class TestConnectionResponse(BaseModel):
    ok: bool
    details: str = ""
    error: str = ""
