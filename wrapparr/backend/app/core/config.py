from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # Security
    secret_key: str
    encryption_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # TMDB
    tmdb_api_key: str = ""

    # First admin
    first_admin_email: str = "admin@example.com"
    first_admin_password: str = "changeme"

    # App
    app_name: str = "Wrapparr"
    debug: bool = False

    model_config = {"env_file": ("../.env", ".env"), "extra": "ignore"}


settings = Settings()
