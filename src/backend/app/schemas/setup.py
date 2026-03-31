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
    email: str = ""


class SetupUser(BaseModel):
    service_username: str
    display_name: str
    email: str = ""
    role: str = "user"


class OptionalService(BaseModel):
    service_type: str
    base_url: str
    api_key: str
    display_name: str = ""


class SetupFinishRequest(BaseModel):
    # Service
    service_type: str
    service_base_url: str
    service_api_key: str
    service_display_name: str = "Tautulli"

    # Optional services (TMDB, Overseerr, etc.)
    optional_services: list[OptionalService] = []

    # Users
    users: list[SetupUser]

    # Auth
    auth_method: str = "password"

    # Admin
    admin_email: str
    admin_password: str
    admin_display_name: str = "Admin"
