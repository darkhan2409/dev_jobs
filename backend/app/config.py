import sys
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # Security
    INTERNAL_SECRET: str = "dev-secret-123"
    ALLOWED_ORIGINS: str = "*"  # Comma-separated list for production
    
    # Scraper settings
    HH_AREA: int = 40  # 40 = Kazakhstan
    
    # Cache settings
    CACHE_EXPIRE_SECONDS: int = 300  # 5 minutes

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


try:
    settings = Settings()
except ValidationError as e:
    print(f"Configuration error: {e}")
    sys.exit(1)
