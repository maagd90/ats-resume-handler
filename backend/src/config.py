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
    free_optimization_limit: int = 3
    jwt_secret: str = "change-me-in-production"
    jwt_expire_hours: int = 168
    app_env: str = "development"
    frontend_url: str = "http://localhost:3000"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    platform_ai_enabled: bool = True

    @property
    def is_production(self) -> bool:
        return self.app_env.lower() == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def llm_configured(self) -> bool:
        if self.llm_provider.lower() == "anthropic":
            return bool(self.anthropic_api_key)
        return bool(self.openai_api_key)

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
