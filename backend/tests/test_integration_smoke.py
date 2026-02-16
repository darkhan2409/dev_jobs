"""
Smoke tests - basic health checks.

Verifies:
- /healthz endpoint returns 200
- /health endpoint returns 200 (extended health check)
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_healthz_returns_200(client: AsyncClient):
    """Test basic health check endpoint."""
    request_id = "integration-healthz-request-id"
    response = await client.get("/healthz", headers={"X-Request-ID": request_id})
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers.get("X-Request-ID") == request_id


@pytest.mark.asyncio
async def test_health_returns_200(client: AsyncClient):
    """Test extended health check endpoint."""
    response = await client.get("/health")
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    
    # Verify response structure
    assert "status" in data
    # Note: database and cache may not be in response if Redis is disabled
