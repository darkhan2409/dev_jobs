import sys
from typing import Optional
import logging
from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


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
    SMTP_TIMEOUT_SECONDS: int = 10
    FROM_EMAIL: str = "noreply@devjobs.kz"
    
    # Frontend URL (for email templates)
    FRONTEND_URL: str = "http://localhost:5173"

    # Cache settings
    CAREER_SESSION_TTL_MINUTES: int = 120
    REDIS_URL: Optional[str] = None
    CACHE_ENABLED: bool = True
    CACHE_TTL_SECONDS: int = 120
    INTERVIEW_SESSION_BACKEND: str = "memory"  # redis | memory
    INTERVIEW_SESSION_MAX_ACTIVE: int = 2000
    DB_STATEMENT_TIMEOUT_SECONDS: int = 30

    # Scraper settings
    HH_AREA: int = 40  # Kazakhstan

    # AI/LLM settings
    OPENAI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gpt-4o"

    # Salary normalization rates
    EXCHANGE_RATE_USD: float = 509.0
    EXCHANGE_RATE_EUR: float = 594.36
    EXCHANGE_RATE_RUB: float = 6.33

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


try:
    settings = Settings()
except ValidationError as e:
    logger.error("Configuration error: %s", e)
    sys.exit(1)
