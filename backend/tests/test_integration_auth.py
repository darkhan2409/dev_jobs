"""
Integration tests for user authentication flow.

Tests:
- User registration (success and duplicate)
- User login (success and invalid credentials)
- Protected endpoint access with auth token
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient):
    """Test successful user registration."""
    # Use unique email for each test run
    import time
    unique_email = f"test{int(time.time())}@example.com"
    
    payload = {
        "email": unique_email,
        "username": f"user{int(time.time())}",
        "password": "SecurePass123!",
        "full_name": "Test User"
    }
    
    response = await client.post("/api/auth/register", json=payload)
    
    # Should be 201 or 200
    assert response.status_code in (200, 201)
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert data["email"] == payload["email"]
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email_fails(client: AsyncClient):
    """Test registration with duplicate email returns 400."""
    import time
    unique_email = f"duplicate{int(time.time())}@example.com"
    
    # Create first user
    payload = {
        "email": unique_email,
        "username": f"user1{int(time.time())}",
        "password": "SecurePass123!"
    }
    response = await client.post("/api/auth/register", json=payload)
    assert response.status_code in (200, 201), f"First registration failed: {response.text}"
    assert response.headers.get("X-Request-ID")
    
    # Try to register with same email
    duplicate_payload = {
        "email": unique_email,
        "username": f"user2{int(time.time())}",
        "password": "SecurePass123!"
    }
    response = await client.post("/api/auth/register", json=duplicate_payload)
    
    assert response.status_code == 400
    assert response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login returns access token."""
    import time
    unique_email = f"logintest{int(time.time())}@example.com"
    password = "SecurePass123!"
    
    # Register user first
    register_payload = {
        "email": unique_email,
        "username": f"logintest{int(time.time())}",
        "password": password
    }
    response = await client.post("/api/auth/register", json=register_payload)
    assert response.status_code in (200, 201), f"Registration failed: {response.text}"
    assert response.headers.get("X-Request-ID")
    
    # Login
    login_payload = {
        "username": unique_email, # Changed from email to username for token endpoint
        "password": password
    }
    response = await client.post("/api/auth/token", data=login_payload)
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid_credentials_fails(client: AsyncClient):
    """Test login with invalid credentials returns 401."""
    payload = {
        "username": "nonexistent@example.com",
        "password": "WrongPassword123!"
    }
    
    response = await client.post("/api/auth/token", data=payload)
    
    # Should be 401
    assert response.status_code == 401
    assert response.headers.get("X-Request-ID")


@pytest.mark.asyncio
async def test_get_current_user_with_auth(client: AsyncClient, auth_headers):
    """Test accessing protected endpoint with valid token."""
    import time
    unique_email = f"authtest{int(time.time())}@example.com"
    
    # Register user
    register_payload = {
        "email": unique_email,
        "username": f"authtest{int(time.time())}",
        "password": "SecurePass123!"
    }
    response = await client.post("/api/auth/register", json=register_payload)
    assert response.status_code in (200, 201), f"Registration failed: {response.text}"
    assert response.headers.get("X-Request-ID")
    
    # Get auth headers
    headers = auth_headers(unique_email)
    
    # Access protected endpoint
    response = await client.get("/api/auth/me", headers=headers)
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert data["email"] == unique_email
