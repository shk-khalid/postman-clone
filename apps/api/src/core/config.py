from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Postman Clone API"
    APP_ENV: str = "development"
    HOST: str = "[IP_ADDRESS]"
    PORT: int = 8000
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite:///./postman.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

settings = Settings()