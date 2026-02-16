import inspect

from app.routers import companies as companies_router
from app.services.vacancy_service import _escape_ilike_value


def test_escape_ilike_value_escapes_like_wildcards():
    assert _escape_ilike_value(r"foo%bar_baz\qux") == r"foo\%bar\_baz\\qux"


def test_companies_router_uses_escaped_ilike_search():
    source = inspect.getsource(companies_router.get_companies)
    assert "_escape_ilike_value" in source
    assert 'escape="\\\\"' in source
