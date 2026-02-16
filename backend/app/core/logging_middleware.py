"""
Request/response logging middleware.
Logs every HTTP request with method, path, status code, latency, and unique request_id.
"""
import logging
import time
import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests and responses.
    
    Logs:
    - HTTP method
    - Request path
    - Status code
    - Latency in milliseconds
    - Unique request_id (UUID4)
    
    Log levels:
    - INFO: 2xx, 3xx status codes
    - DEBUG: 400, 404, 422 (noisy validation/not found errors)
    - WARNING: 401, 403, 429 (signal: auth/rate limit issues)
    - ERROR: 5xx status codes
    
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Reuse inbound request ID when provided, otherwise generate one.
        inbound_request_id = request.headers.get("X-Request-ID")
        if inbound_request_id and inbound_request_id.strip():
            request_id = inbound_request_id.strip()
        else:
            request_id = str(uuid.uuid4())
        
        # Store request_id in request state for use in exception handlers
        request.state.request_id = request_id
        
        # Record start time
        start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Calculate latency
        latency_ms = (time.time() - start_time) * 1000
        
        # Determine log level based on status code
        status_code = response.status_code
        log_message = (
            f"request_id={request_id} method={request.method} "
            f"path={request.url.path} status={status_code} latency={latency_ms:.2f}ms"
        )
        
        if status_code < 400:
            # 2xx, 3xx - success
            logger.info(log_message)
        elif status_code < 500:
            # 4xx - client errors, differentiate by type
            if status_code in (400, 404, 422):
                # Noisy errors: validation, not found, unprocessable entity
                logger.debug(log_message)
            elif status_code in (401, 403, 429):
                # Signal errors: unauthorized, forbidden, rate limited
                logger.warning(log_message)
            else:
                # Other 4xx errors - log at debug by default
                logger.debug(log_message)
        else:
            # 5xx - server errors
            logger.error(log_message)
        
        # Add request_id to response headers for debugging
        response.headers["X-Request-ID"] = request_id
        
        return response
