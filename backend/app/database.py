from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


# Build async database URL from sync URL
if settings.DATABASE_URL.startswith("postgresql://"):
    async_database_url = settings.DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://", 1
    )
elif settings.DATABASE_URL.startswith("postgresql+psycopg2://"):
    async_database_url = settings.DATABASE_URL.replace(
        "postgresql+psycopg2://", "postgresql+asyncpg://", 1
    )
elif settings.DATABASE_URL.startswith("sqlite:///"):
    async_database_url = settings.DATABASE_URL.replace(
        "sqlite:///", "sqlite+aiosqlite:///", 1
    )
else:
    async_database_url = settings.DATABASE_URL


statement_timeout_ms = max(1000, settings.DB_STATEMENT_TIMEOUT_SECONDS * 1000)
async_connect_args = {}
sync_connect_args = {}

if async_database_url.startswith("postgresql+asyncpg://"):
    async_connect_args["server_settings"] = {
        "statement_timeout": str(statement_timeout_ms)
    }
if settings.DATABASE_URL.startswith("postgresql://") or settings.DATABASE_URL.startswith("postgresql+psycopg2://"):
    sync_connect_args["options"] = f"-c statement_timeout={statement_timeout_ms}"

# Async SQLAlchemy engine with production settings (for API)
engine = create_async_engine(
    async_database_url,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL debugging
    connect_args=async_connect_args,
)

# Async session factory (for API)
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Sync engine and session (for scripts and background tasks)
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args=sync_connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)


# Base class for models (SQLAlchemy 2.0 style)
class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database session."""
    async with AsyncSessionLocal() as session:
        yield session
