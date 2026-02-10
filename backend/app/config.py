import sys
from typing import Optional
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Database
    DATABASE_URL: str

    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15  # Reduced from 30 to 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24
    PASSWORD_RESET_EXPIRE_HOURS: int = 1

    # Security
    INTERNAL_SECRET: str
    ALLOWED_ORIGINS: str = "http://localhost:5173"  # Comma-separated list for production
    ENV: str = "dev"

    # Email settings
    EMAIL_ENABLED: bool = False  # False for dev mode
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    FROM_EMAIL: str = "noreply@devjobs.kz"
    
    # Frontend URL (for email templates)
    FRONTEND_URL: str = "http://localhost:5173"

    # Scraper settings
    HH_AREA: int = 40  # 40 = Kazakhstan

    # Cache settings
    CACHE_EXPIRE_SECONDS: int = 300  # 5 minutes
    CAREER_SESSION_TTL_MINUTES: int = 120

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
