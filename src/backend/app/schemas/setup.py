from pydantic import BaseModel


class SetupStatusResponse(BaseModel):
    needed: bool


class SetupTestServiceRequest(BaseModel):
    service_type: str
    base_url: str
    api_key: str


class SetupTestServiceResponse(BaseModel):
    ok: bool
    error: str = ""


class SetupFetchUsersRequest(BaseModel):
    service_type: str
    base_url: str
    api_key: str


class ServiceUser(BaseModel):
    id: str
    name: str


class SetupUser(BaseModel):
    service_username: str
    display_name: str
    role: str = "user"


class SetupFinishRequest(BaseModel):
    # Service
    service_type: str
    service_base_url: str
    service_api_key: str
    service_display_name: str = "Tautulli"

    # Users
    users: list[SetupUser]

    # Auth
    auth_method: str = "password"

    # Admin
    admin_email: str
    admin_password: str
    admin_display_name: str = "Admin"
