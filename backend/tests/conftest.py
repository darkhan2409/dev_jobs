"""
Pytest configuration and fixtures for integration tests.

Provides:
- DB safety guard (fail if not test database)
- Alembic migrations runner  
- FastAPI test client
- Helper for auth headers
"""
import os
import sys
import platform
from pathlib import Path
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from tenacity import retry, stop_after_attempt, wait_fixed
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport
from alembic.config import Config
from alembic import command
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

# Add backend root to path
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# ============================================================================
#  1. GLOBAL CONFIG & UTILS
# ============================================================================

# Use "dev_jobs_test" database. 
# Ensure DATABASE_URL env var is set correctly before running tests!
# Default fallback (but should be set by Env/CI):
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:1234@localhost:5432/dev_jobs_test")
os.environ.setdefault("JWT_SECRET_KEY", "test_secret_key_12345")
os.environ.setdefault("INTERNAL_SECRET", "test_internal_secret")
# Disable external services
os.environ.setdefault("EMAIL_ENABLED", "false")
os.environ.setdefault("REDIS_URL", "")  # Use in-memory cache

# Import after env setup
from app.main import app
from app.database import get_db, Base
from app.auth import create_access_token


@pytest.fixture(scope="session", autouse=True)
def init_cache():
    """Initialize FastAPI cache with in-memory backend for tests."""
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache-test")
    yield


# ============================================================================
# DB SAFETY GUARD
# ============================================================================

def pytest_configure(config):
    """
    Pytest hook: runs before test collection.
    Enforces DB safety - tests must use a test database.
    """
    db_url = os.environ.get("DATABASE_URL", "")
    
    # Safety check: DATABASE_URL must contain "test" to prevent accidental production runs
    if "test" not in db_url.lower():
        raise RuntimeError(
            f"DB SAFETY GUARD: Refusing to run tests against non-test database.\n"
            f"DATABASE_URL must contain 'test' in the name.\n"
            f"Current: {db_url}\n"
            f"Example: postgresql+asyncpg://postgres:password@localhost:5432/dev_jobs_test"
        )
    
    print(f"\nDB Safety Guard: Using test database: {db_url}")


# ============================================================================
# SESSION-SCOPED FIXTURES (run once per test session)
# ============================================================================

@pytest.fixture(scope="session")
def db_url() -> str:
    """Get test database URL."""
    return os.environ["DATABASE_URL"]


@pytest.fixture(scope="session", autouse=True)
def run_migrations(db_url: str):
    """
    Run Alembic migrations once before all tests.
    Uses sync connection for Alembic compatibility.
    """
    # Convert async URL to sync for Alembic (use psycopg2, not asyncpg)
    sync_db_url = db_url.replace("+asyncpg", "")
    
    # Configure Alembic
    alembic_cfg = Config(str(BACKEND_ROOT / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", sync_db_url)
    
    # Run migrations
    print("\nRunning Alembic migrations...")
    try:
        command.upgrade(alembic_cfg, "head")
        print("Migrations complete")
    except Exception as e:
        print(f"Migration warning (may be OK if DB already migrated): {e}")
    
    yield


# ============================================================================
# FUNCTION-SCOPED FIXTURES (run for each test)
# ============================================================================

@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Provide FastAPI test client.
    Uses NullPool to avoid event-loop binding issues on Windows.
    """
    # Create a test engine with NullPool to avoid stale connections across event loops
    test_engine = create_async_engine(
        os.environ["DATABASE_URL"],
        poolclass=NullPool,
        echo=False,
    )
    test_session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
        timeout=10.0
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
    await test_engine.dispose()


@pytest.fixture
def auth_headers() -> callable:
    """
    Helper fixture to create authentication headers.
    
    Usage:
        headers = auth_headers("test@example.com")
        response = await client.get("/api/auth/me", headers=headers)
    """
    def _create_headers(user_email: str) -> dict:
        """Create Bearer token headers for given user email."""
        access_token = create_access_token(data={"sub": user_email})
        return {"Authorization": f"Bearer {access_token}"}
    
    return _create_headers
