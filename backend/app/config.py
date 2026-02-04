import sys
from typing import Optional
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""
    
    # Database
    DATABASE_URL: str
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Security
    INTERNAL_SECRET: str = "dev-secret-123"
    ALLOWED_ORIGINS: str = "*"  # Comma-separated list for production
    
    # Scraper settings
    HH_AREA: int = 40  # 40 = Kazakhstan
    
    # Cache settings
    CACHE_EXPIRE_SECONDS: int = 300  # 5 minutes

    # AI/LLM settings
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o"

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
