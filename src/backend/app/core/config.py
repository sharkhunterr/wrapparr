import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database — defaults to local SQLite (no PostgreSQL needed)
    database_url: str = "sqlite+aiosqlite:///data/wrapparr.db"

    # Redis — optional, defaults to empty (disabled)
    redis_url: str = ""

    # Security — auto-generated if not provided
    secret_key: str = ""
    encryption_key: str = ""
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

    model_config = {"env_file": ("../.env", ".env", "/app/.env"), "extra": "ignore"}

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Auto-generate keys if not set (persisted in data dir)
        if not self.secret_key or not self.encryption_key:
            self._auto_generate_keys()

    def _auto_generate_keys(self):
        import os
        keys_file = os.path.join(os.path.dirname(self.database_url.replace("sqlite+aiosqlite:///", "").split("?")[0]) if "sqlite" in self.database_url else "data", ".keys")
        try:
            os.makedirs(os.path.dirname(keys_file) if os.path.dirname(keys_file) else "data", exist_ok=True)
        except Exception:
            keys_file = "data/.keys"
            os.makedirs("data", exist_ok=True)

        if os.path.exists(keys_file):
            with open(keys_file) as f:
                lines = f.read().strip().split("\n")
                if len(lines) >= 2:
                    if not self.secret_key:
                        object.__setattr__(self, "secret_key", lines[0])
                    if not self.encryption_key:
                        object.__setattr__(self, "encryption_key", lines[1])
                    return

        sk = self.secret_key or secrets.token_urlsafe(64)
        ek = self.encryption_key or secrets.token_urlsafe(64)
        object.__setattr__(self, "secret_key", sk)
        object.__setattr__(self, "encryption_key", ek)
        with open(keys_file, "w") as f:
            f.write(f"{sk}\n{ek}\n")


settings = Settings()
