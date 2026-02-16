import pytest

from app.interview import orchestrator as orchestrator_module
from app.interview.storage.session_store import SessionBackendUnavailableError


class _DummyManager:
    def __init__(self, *args, **kwargs):
        pass


class _DummyQuestionBankManager:
    def __init__(self, *args, **kwargs):
        pass


class _DummyAggregationEngine:
    def __init__(self, response_store):
        self.response_store = response_store


class _DummyStageEngine:
    def __init__(self, *args, **kwargs):
        pass


class _FailingRedisSessionStore:
    def __init__(self, *args, **kwargs):
        raise SessionBackendUnavailableError("redis unavailable")


class _MemorySessionStore:
    def __init__(self, *args, **kwargs):
        pass


def _patch_orchestrator_dependencies(monkeypatch):
    monkeypatch.setattr(orchestrator_module, "RoleProfileManager", _DummyManager)
    monkeypatch.setattr(orchestrator_module, "SignalDictionaryManager", _DummyManager)
    monkeypatch.setattr(orchestrator_module, "QuestionBankManager", _DummyQuestionBankManager)
    monkeypatch.setattr(orchestrator_module, "AggregationEngine", _DummyAggregationEngine)
    monkeypatch.setattr(orchestrator_module, "RoleCatalogManager", _DummyManager)
    monkeypatch.setattr(orchestrator_module, "StageManager", _DummyManager)
    monkeypatch.setattr(orchestrator_module, "StageAggregationEngine", _DummyStageEngine)
    monkeypatch.setattr(orchestrator_module.settings, "INTERVIEW_SESSION_MAX_ACTIVE", 2000, raising=False)
    monkeypatch.setattr(orchestrator_module.settings, "REDIS_URL", "redis://127.0.0.1:6399/0", raising=False)


def test_falls_back_to_memory_when_redis_unavailable_in_dev(monkeypatch):
    _patch_orchestrator_dependencies(monkeypatch)
    monkeypatch.setattr(orchestrator_module, "RedisSessionStore", _FailingRedisSessionStore)
    monkeypatch.setattr(orchestrator_module, "UserResponseStore", _MemorySessionStore)
    monkeypatch.setattr(orchestrator_module.settings, "ENV", "dev", raising=False)

    orchestrator = orchestrator_module.ITCareerTestOrchestrator(
        enable_llm=False,
        session_backend="redis",
    )

    assert isinstance(orchestrator.response_store, _MemorySessionStore)
    assert orchestrator._session_backend == "memory"


def test_raises_when_redis_unavailable_in_prod(monkeypatch):
    _patch_orchestrator_dependencies(monkeypatch)
    monkeypatch.setattr(orchestrator_module, "RedisSessionStore", _FailingRedisSessionStore)
    monkeypatch.setattr(orchestrator_module, "UserResponseStore", _MemorySessionStore)
    monkeypatch.setattr(orchestrator_module.settings, "ENV", "prod", raising=False)

    with pytest.raises(SessionBackendUnavailableError):
        orchestrator_module.ITCareerTestOrchestrator(
            enable_llm=False,
            session_backend="redis",
        )
