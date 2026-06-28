from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Postman Clone API"
    APP_ENV: str = "development"
    HOST: str = "[IP_ADDRESS]"
    PORT: int = 8000
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./postman.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
    ALLOWED_HOSTS: str

    DEFAULT_TIMEOUT: float = 10.0
    DEFAULT_VERIFY_SSL: bool = True
    DEFAULT_FOLLOW_REDIRECTS: bool = True
    DEFAULT_MAX_RESPONSE_SIZE: int = 10485760

    @property
    def allowed_hosts_list(self) -> list[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",") if host.strip()]

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()