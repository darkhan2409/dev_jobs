"""
Redis client singleton for async FastAPI.

Provides:
- get_redis() → async Redis client or None if disabled
- Lifecycle hooks for FastAPI startup/shutdown
"""
import logging
from typing import Optional
from redis.asyncio import Redis
from app.config import settings

logger = logging.getLogger(__name__)

# Singleton instance
_redis_client: Optional[Redis] = None


async def init_redis() -> Optional[Redis]:
    """
    Initialize Redis client on FastAPI startup.

    Returns:
        Redis client if REDIS_URL is configured, None otherwise.
    """
    global _redis_client

    if not settings.REDIS_URL:
        logger.warning("REDIS_URL not configured. Cache will be disabled.")
        return None

    try:
        _redis_client = Redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
        # Test connection
        await _redis_client.ping()
        logger.info(f"Redis connected: {settings.REDIS_URL}")
        return _redis_client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}. Cache will be disabled.")
        _redis_client = None
        return None


async def close_redis() -> None:
    """Close Redis connection on FastAPI shutdown."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.aclose()
        logger.info("Redis connection closed")
        _redis_client = None


def get_redis() -> Optional[Redis]:
    """
    Get the singleton Redis client.

    Returns:
        Redis client if initialized and connected, None otherwise.
    """
    return _redis_client
