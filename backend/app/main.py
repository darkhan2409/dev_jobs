from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

from app.config import settings
from app.database import engine, sync_engine
from app.routers import (
    users,
    recommendations,
    interview,
    auth,
    vacancies,
    companies,
    metrics,
    admin,
    analytics
)
from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize InMemory Cache (Redis removed)
    FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")

    yield

    # Shutdown: Close database connections gracefully
    await engine.dispose()
    sync_engine.dispose()

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
    logging.getLogger("uvicorn.error").warning(
        "CORS: ALLOWED_ORIGINS='*' enabled in dev; credentials are disabled."
    )
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

# API Routes
app.include_router(auth.router)
app.include_router(vacancies.router)
app.include_router(companies.router)
app.include_router(metrics.router)
app.include_router(users.router)  # Existing users router
app.include_router(recommendations.router)
app.include_router(interview.router)
app.include_router(admin.router)
app.include_router(analytics.router)

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "service": "GitJob API"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors."""    
    logger = logging.getLogger("uvicorn.error")
    logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
