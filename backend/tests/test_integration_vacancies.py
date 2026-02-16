"""
Integration tests for vacancy CRUD operations.

Tests:
- Get vacancies (empty and with data)
- Get vacancy by ID (not found)
- Filter vacancies
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_vacancies_returns_list(client: AsyncClient):
    """Test getting vacancies returns paginated list."""
    response = await client.get("/api/vacancies")
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "per_page" in data
    assert isinstance(data["items"], list)


@pytest.mark.asyncio
async def test_get_vacancy_not_found(client: AsyncClient):
    """Test getting non-existent vacancy returns 404."""
    response = await client.get("/api/vacancies/99999999")
    
    assert response.status_code == 404
    assert response.headers.get("X-Request-ID")
    assert "not found" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_filter_vacancies_by_grade(client: AsyncClient):
    """Test filtering vacancies by grade parameter."""
    response = await client.get("/api/vacancies?grade=Junior")
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert "items" in data
    # If there are results, they should all be Junior
    if data["items"]:
        assert all(item.get("grade") == "Junior" for item in data["items"])


@pytest.mark.asyncio
async def test_filter_vacancies_by_location(client: AsyncClient):
    """Test filtering vacancies by location parameter."""
    response = await client.get("/api/vacancies?location=Almaty")
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_get_filters_endpoint(client: AsyncClient):
    """Test getting filter options for UI."""
    response = await client.get("/api/filters")
    
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID")
    data = response.json()
    assert "locations" in data
    assert "grades" in data
    assert "technologies" in data


@pytest.mark.asyncio
async def test_get_vacancies_invalid_page_returns_422(client: AsyncClient):
    """Test invalid query params return validation error."""
    response = await client.get("/api/vacancies?page=0")

    assert response.status_code == 422
    assert response.headers.get("X-Request-ID")
