import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    display_name: str
    role: str
    allow_comparison: bool
    theme_pack_id: uuid.UUID | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── OIDC Provider schemas ──

class OIDCProviderCreate(BaseModel):
    name: str
    issuer_url: str
    client_id: str
    client_secret: str
    scopes: str = "openid email profile"


class OIDCProviderUpdate(BaseModel):
    name: str | None = None
    issuer_url: str | None = None
    client_id: str | None = None
    client_secret: str | None = None
    scopes: str | None = None
    is_active: bool | None = None


class OIDCProviderResponse(BaseModel):
    id: uuid.UUID
    name: str
    issuer_url: str
    client_id: str
    scopes: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class OIDCProviderPublic(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}
