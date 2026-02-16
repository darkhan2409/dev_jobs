import asyncio
import json

from app import main as app_main


class _DummyConnection:
    async def execute(self, _query):
        return 1


class _DummyConnectContext:
    async def __aenter__(self):
        return _DummyConnection()

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _DummyEngine:
    def connect(self):
        return _DummyConnectContext()


def _response_payload(response):
    return json.loads(response.body.decode("utf-8"))


def test_ready_skips_redis_when_not_configured(monkeypatch):
    monkeypatch.setattr(app_main, "engine", _DummyEngine())
    monkeypatch.setattr(app_main, "redis_client", None)
    monkeypatch.setattr(app_main.settings, "REDIS_URL", None, raising=False)

    response = asyncio.run(app_main.readiness_check())
    payload = _response_payload(response)

    assert response.status_code == 200
    assert payload["checks"]["database"] == "ok"
    assert payload["checks"]["redis"] == "skipped"


def test_ready_fails_when_redis_required_but_unavailable(monkeypatch):
    monkeypatch.setattr(app_main, "engine", _DummyEngine())
    monkeypatch.setattr(app_main, "redis_client", None)
    monkeypatch.setattr(app_main.settings, "REDIS_URL", "redis://127.0.0.1:6379/0", raising=False)

    response = asyncio.run(app_main.readiness_check())
    payload = _response_payload(response)

    assert response.status_code == 503
    assert payload["checks"]["database"] == "ok"
    assert payload["checks"]["redis"] == "failed"
