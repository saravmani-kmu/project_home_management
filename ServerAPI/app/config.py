from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    database_url: str = f"sqlite:///{BASE_DIR / 'home_management.db'}"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7

    frontend_base_url: str = "http://localhost:5174"
    mobile_scheme: str = "hearth://"


settings = Settings()
