"""
Cache helper functions for endpoint-level caching.

Features:
- Normalized cache keys from path + query params
- JSON serialization/deserialization
- Fail-open behavior (API works even if Redis is down)
- Cache hit/miss logging with request tracking
"""
import json
import logging
import hashlib
from typing import Optional, Any
from urllib.parse import urlencode, parse_qs
from app.config import settings
from app.infra.redis_client import get_redis

logger = logging.getLogger(__name__)


def build_cache_key(path: str, query_params: dict) -> str:
    """
    Build normalized cache key from API path and query parameters.

    Args:
        path: API path (e.g. "/api/vacancies")
        query_params: Dict of query parameters

    Returns:
        Normalized cache key like "cache:v1:/api/vacancies?grade=Junior&location=Almaty"
    """
    # Sort query params for consistent keys regardless of param order
    sorted_params = sorted(query_params.items())
    query_string = urlencode(sorted_params) if sorted_params else ""

    # Build key with version prefix
    key = f"cache:v1:{path}"
    if query_string:
        key = f"{key}?{query_string}"

    return key


def _serialize_response(data: Any) -> str:
    """Serialize response data to JSON string."""
    return json.dumps(data, ensure_ascii=False, separators=(',', ':'))


def _deserialize_response(data: str) -> Any:
    """Deserialize JSON string to Python object."""
    return json.loads(data)


async def get_cached_response(cache_key: str, request_id: Optional[str] = None) -> Optional[Any]:
    """
    Get cached response from Redis.

    Args:
        cache_key: Cache key
        request_id: Optional request ID for logging

    Returns:
        Cached response data if found, None otherwise
    """
    if not settings.CACHE_ENABLED:
        return None

    redis = get_redis()
    if redis is None:
        return None

    try:
        cached_value = await redis.get(cache_key)
        if cached_value is not None:
            logger.info(
                f"cache_hit cache_key={cache_key} request_id={request_id or 'N/A'}"
            )
            return _deserialize_response(cached_value)
        else:
            logger.info(
                f"cache_miss cache_key={cache_key} request_id={request_id or 'N/A'}"
            )
            return None
    except Exception as e:
        # Fail-open: log error but don't crash
        logger.warning(
            f"cache_error operation=get cache_key={cache_key} error={e} request_id={request_id or 'N/A'}"
        )
        return None


async def set_cached_response(
    cache_key: str,
    data: Any,
    ttl_seconds: Optional[int] = None,
    request_id: Optional[str] = None
) -> bool:
    """
    Store response in Redis cache with TTL.

    Args:
        cache_key: Cache key
        data: Response data to cache
        ttl_seconds: TTL in seconds (defaults to settings.CACHE_TTL_SECONDS)
        request_id: Optional request ID for logging

    Returns:
        True if cached successfully, False otherwise
    """
    if not settings.CACHE_ENABLED:
        return False

    redis = get_redis()
    if redis is None:
        return False

    if ttl_seconds is None:
        ttl_seconds = settings.CACHE_TTL_SECONDS

    try:
        serialized = _serialize_response(data)
        await redis.setex(cache_key, ttl_seconds, serialized)
        logger.info(
            f"cache_set cache_key={cache_key} ttl={ttl_seconds}s request_id={request_id or 'N/A'}"
        )
        return True
    except Exception as e:
        # Fail-open: log error but don't crash
        logger.warning(
            f"cache_error operation=set cache_key={cache_key} error={e} request_id={request_id or 'N/A'}"
        )
        return False
