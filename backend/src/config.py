from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = ""
    anthropic_api_key: str = ""
    llm_provider: str = "openai"
    jsearch_api_key: str = ""
    database_url: str = "sqlite:///./ats_agent.db"
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: str = "./uploads"
    applications_dir: str = "./applications"
    cors_origins: str = "http://localhost:3000"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    default_search_interval_hours: int = 4
    default_min_fit_score: int = 75
    default_max_applications_per_day: int = 10

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def applications_path(self) -> Path:
        path = Path(self.applications_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def sync_database_url(self) -> str:
        url = self.database_url
        if url.startswith("sqlite+aiosqlite"):
            return url.replace("sqlite+aiosqlite", "sqlite", 1)
        return url


settings = Settings()
