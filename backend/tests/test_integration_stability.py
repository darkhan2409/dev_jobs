"""
Stability test - ensures requests complete within reasonable timeout.

Prevents production hangs by verifying endpoints respond promptly.
"""
import pytest
from httpx import AsyncClient
import asyncio


@pytest.mark.asyncio
async def test_request_completes_within_timeout(client: AsyncClient):
    """Test that API request completes within 5 seconds (no hanging)."""
    timeout_seconds = 5
    
    try:
        # Use asyncio.wait_for to enforce timeout
        response = await asyncio.wait_for(
            client.get("/api/vacancies?limit=10"),
            timeout=timeout_seconds
        )
        
        # If we get here, request completed within timeout
        assert response.status_code in (200, 404, 500)  # Any response is fine
        assert response.headers.get("X-Request-ID")
        
    except asyncio.TimeoutError:
        pytest.fail(f"Request did not complete within {timeout_seconds} seconds - potential hang detected")
