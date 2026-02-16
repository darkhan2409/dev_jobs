import asyncio
from types import SimpleNamespace

from starlette.requests import Request

from app.routers import interview as interview_router


def _unwrap(function):
    while hasattr(function, "__wrapped__"):
        function = function.__wrapped__
    return function


class _DummyOrchestrator:
    def complete_test(self, session_id: str, skip_llm: bool):
        return SimpleNamespace(
            session_id=session_id,
            ranked_roles=[("backend_developer", 0.91)],
            signal_profile={"logic": 3},
            interpretation=None,
            stage_result=None,
            warnings=["stage_unavailable", "llm_unavailable"],
        )


def test_complete_test_returns_warnings(monkeypatch):
    async def _get_orchestrator():
        return _DummyOrchestrator()

    monkeypatch.setattr(interview_router, "get_orchestrator", _get_orchestrator)

    request = Request(
        {
            "type": "http",
            "method": "POST",
            "path": "/api/interview/complete/session_1",
            "headers": [],
            "client": ("127.0.0.1", 12345),
        }
    )

    complete_test = _unwrap(interview_router.complete_test)
    result = asyncio.run(complete_test(request, "session_1", False))

    assert result.warnings == ["stage_unavailable", "llm_unavailable"]
