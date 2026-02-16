from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend
from redis.asyncio import Redis
from sqlalchemy import text
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.core.limiter import limiter
from app.core.logging_middleware import LoggingMiddleware
from app.database import engine, sync_engine
from app.logging_config import configure_logging
from app.infra.redis_client import init_redis, close_redis
from app.routers import (
    admin,
    analytics,
    auth,
    companies,
    interview,
    metrics,
    recommendations,
    users,
    vacancies,
)

# Configure logging first
configure_logging()

logger = logging.getLogger(__name__)
redis_client: Optional[Redis] = None


def _validate_prod_settings() -> None:
    if settings.ENV.lower() != "prod":
        return

    errors = []
    if settings.ALLOWED_ORIGINS == "*":
        errors.append("ALLOWED_ORIGINS='*' is not allowed in production")
    if not settings.FRONTEND_URL.startswith("https://"):
        errors.append("FRONTEND_URL must use https:// in production")
    if "localhost" in settings.FRONTEND_URL:
        errors.append("FRONTEND_URL cannot point to localhost in production")

    if not settings.EMAIL_ENABLED:
        errors.append("EMAIL_ENABLED must be true in production")
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        errors.append("SMTP_HOST/SMTP_USER/SMTP_PASSWORD are required in production")

    weak_secrets = {"dev-secret-123", "test-jwt-secret", "changeme"}
    if settings.JWT_SECRET_KEY in weak_secrets or len(settings.JWT_SECRET_KEY) < 32:
        errors.append("JWT_SECRET_KEY is too weak for production")
    if settings.INTERNAL_SECRET in weak_secrets or len(settings.INTERNAL_SECRET) < 32:
        errors.append("INTERNAL_SECRET is too weak for production")

    if not settings.REDIS_URL:
        errors.append("REDIS_URL must be configured in production")

    if errors:
        raise RuntimeError("Production startup checks failed: " + "; ".join(errors))


_validate_prod_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_client

    # Startup: Initialize endpoint-level Redis cache
    await init_redis()

    # Startup: Initialize FastAPI-cache backend (for @cache decorator)
    if settings.REDIS_URL:
        try:
            redis_client = Redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)
            await redis_client.ping()
            FastAPICache.init(RedisBackend(redis_client), prefix="fastapi-cache")
            logger.info("FastAPI cache backend initialized: redis")
        except Exception:
            logger.exception("Redis cache initialization failed, falling back to in-memory cache")
            redis_client = None
            FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    else:
        logger.warning("REDIS_URL is not configured. FastAPI cache uses in-memory backend.")
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

    yield

    # Shutdown: Close connections gracefully
    await close_redis()
    await engine.dispose()
    sync_engine.dispose()
    if redis_client is not None:
        await redis_client.aclose()
        redis_client = None


app = FastAPI(
    title="GitJob API",
    description="API for GitJob KZ - Kazakhstan IT Job Board. Provides endpoints for vacancies, companies, and metrics.",
    version="1.0.0",
    lifespan=lifespan
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Setup
allowed_origins_raw = settings.ALLOWED_ORIGINS

if settings.ENV != "dev" and allowed_origins_raw == "*":
    raise RuntimeError("ALLOWED_ORIGINS='*' is not allowed in production.")

if allowed_origins_raw == "*":
    allowed_origins = ["*"]
    allow_credentials = False
    logger.warning("CORS: ALLOWED_ORIGINS='*' enabled in dev; credentials are disabled.")
else:
    allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# API Routes
app.include_router(auth.router)
app.include_router(vacancies.router)
app.include_router(companies.router)
app.include_router(metrics.router)
app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(interview.router)
app.include_router(admin.router)
app.include_router(analytics.router)


@app.get("/healthz")
def healthz():
    """Minimal health check endpoint."""
    return {"status": "ok"}


@app.get("/health")
def health_check():
    """Lightweight liveness probe."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "GitJob API"
    }


@app.get("/ready")
async def readiness_check():
    """Readiness probe: API is ready only when DB and Redis are reachable."""
    db_ok = False
    redis_status = "failed"
    redis_required = bool(settings.REDIS_URL)

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        logger.exception("Readiness DB check failed")

    if redis_required:
        try:
            if redis_client is not None:
                await redis_client.ping()
                redis_status = "ok"
        except Exception:
            logger.exception("Readiness Redis check failed")
    else:
        redis_status = "skipped"

    is_ready = db_ok and (redis_status == "ok" if redis_required else True)
    return JSONResponse(
        status_code=200 if is_ready else 503,
        content={
            "status": "ok" if is_ready else "not_ready",
            "checks": {
                "database": "ok" if db_ok else "failed",
                "redis": redis_status,
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""
    # Extract request_id from request state (set by LoggingMiddleware)
    request_id = getattr(request.state, "request_id", "unknown")
    
    # Log error with full context
    logger.error(
        "Unhandled error: request_id=%s method=%s path=%s error=%s",
        request_id,
        request.method,
        request.url.path,
        str(exc),
        exc_info=True
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": request_id
        }
    )
