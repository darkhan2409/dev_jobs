"""
Redis-backed interview session store.
"""

from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import logging
import time
from typing import List, Optional
from uuid import uuid4

import redis
from redis.exceptions import RedisError

from app.config import settings

from ..models.user_response import SessionModel, SessionStatus, UserResponse
from .question_bank_manager import QuestionBankManager
from .session_store import SessionStore, SessionBackendUnavailableError, SessionLimitExceededError
from .user_response_store import InvalidReferenceError, SessionCompleteError, SessionNotFoundError

logger = logging.getLogger(__name__)


class RedisSessionStore(SessionStore):
    """Session store backed by Redis with TTL and distributed locks."""

    _SESSION_KEY_PREFIX = "interview:session:"
    _SESSION_LOCK_PREFIX = "interview:session:lock:"
    _ACTIVE_SESSIONS_KEY = "interview:sessions:active"
    _CREATE_LOCK_KEY = "interview:sessions:create_lock"

    def __init__(
        self,
        question_bank_manager: QuestionBankManager,
        redis_url: Optional[str] = None,
        max_active_sessions: Optional[int] = None,
    ):
        self._question_bank_manager = question_bank_manager
        self._redis_url = redis_url or settings.REDIS_URL
        if not self._redis_url:
            raise SessionBackendUnavailableError(
                "REDIS_URL is required when INTERVIEW_SESSION_BACKEND=redis"
            )

        self._max_active_sessions = (
            max_active_sessions
            if max_active_sessions is not None
            else settings.INTERVIEW_SESSION_MAX_ACTIVE
        )
        self._ttl_seconds = max(60, settings.CAREER_SESSION_TTL_MINUTES * 60)
        self._redis = redis.Redis.from_url(
            self._redis_url,
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=10
        )

        try:
            self._redis.ping()
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                "Interview Redis session backend is unavailable"
            ) from exc

    def _session_key(self, session_id: str) -> str:
        return f"{self._SESSION_KEY_PREFIX}{session_id}"

    def _session_lock_key(self, session_id: str) -> str:
        return f"{self._SESSION_LOCK_PREFIX}{session_id}"

    @contextmanager
    def _redis_lock(self, lock_key: str):
        lock = self._redis.lock(lock_key, timeout=10, blocking_timeout=3)
        started = time.monotonic()
        acquired = lock.acquire(blocking=True)
        wait_ms = int((time.monotonic() - started) * 1000)
        logger.info("redis_lock_wait_ms=%s lock_key=%s", wait_ms, lock_key)

        if not acquired:
            raise SessionBackendUnavailableError("Could not acquire Redis session lock")

        try:
            yield
        finally:
            try:
                lock.release()
            except Exception:
                logger.warning("Failed to release Redis lock: %s", lock_key)

    def _save_session(self, session: SessionModel) -> None:
        self._redis.set(
            self._session_key(session.session_id),
            session.model_dump_json(),
            ex=self._ttl_seconds,
        )

    def _load_session(self, session_id: str) -> SessionModel:
        payload = self._redis.get(self._session_key(session_id))
        if not payload:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        return SessionModel.model_validate_json(payload)

    def _prune_active_index(self) -> None:
        session_ids = self._redis.zrange(self._ACTIVE_SESSIONS_KEY, 0, -1)
        if not session_ids:
            return

        pipeline = self._redis.pipeline()
        for session_id in session_ids:
            pipeline.exists(self._session_key(session_id))
        exists_flags = pipeline.execute()

        stale_ids = [
            session_id
            for session_id, exists in zip(session_ids, exists_flags)
            if not exists
        ]
        if stale_ids:
            self._redis.zrem(self._ACTIVE_SESSIONS_KEY, *stale_ids)

    def create_session(self) -> SessionModel:
        try:
            with self._redis_lock(self._CREATE_LOCK_KEY):
                self._prune_active_index()
                active_count = int(self._redis.zcard(self._ACTIVE_SESSIONS_KEY) or 0)
                if active_count >= self._max_active_sessions:
                    raise SessionLimitExceededError("Too many active interview sessions")

                session_id = f"session_{uuid4()}"
                now = datetime.now(timezone.utc)
                session = SessionModel(
                    session_id=session_id,
                    responses=[],
                    status=SessionStatus.IN_PROGRESS,
                    locked_question_bank_version=self._question_bank_manager.get_version(),
                    created_at=now,
                    expires_at=now + timedelta(seconds=self._ttl_seconds),
                )

                self._question_bank_manager.lock_question_bank(session_id)
                try:
                    self._save_session(session)
                    self._redis.zadd(self._ACTIVE_SESSIONS_KEY, {session_id: now.timestamp()})
                except RedisError:
                    self._question_bank_manager.unlock_question_bank(session_id)
                    raise

                return session
        except SessionLimitExceededError:
            raise
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                "Redis backend failed while creating interview session"
            ) from exc

    def store_response(self, session_id: str, question_id: str, answer_option_id: str) -> UserResponse:
        try:
            with self._redis_lock(self._session_lock_key(session_id)):
                session = self._load_session(session_id)
                if session.status == SessionStatus.COMPLETED:
                    raise SessionCompleteError(
                        f"Cannot add responses to completed session '{session_id}'"
                    )

                question = self._question_bank_manager.get_question(question_id)
                if question is None:
                    raise InvalidReferenceError(f"Invalid question ID: '{question_id}'")

                answer_option = next(
                    (option for option in question.answer_options if option.id == answer_option_id),
                    None,
                )
                if answer_option is None:
                    raise InvalidReferenceError(
                        f"Invalid answer option ID: '{answer_option_id}' for question '{question_id}'"
                    )

                user_response = UserResponse(
                    session_id=session_id,
                    question_id=question_id,
                    answer_option_id=answer_option_id,
                    resolved_signals=answer_option.signal_associations.copy(),
                    resolved_weights=answer_option.role_weights.copy(),
                    resolved_stage_weights=answer_option.stage_weights.copy(),
                    timestamp=datetime.now(timezone.utc),
                )

                existing_idx = next(
                    (idx for idx, response in enumerate(session.responses) if response.question_id == question_id),
                    None,
                )
                if existing_idx is None:
                    session.responses.append(user_response)
                else:
                    session.responses[existing_idx] = user_response

                self._save_session(session)
                return user_response
        except (SessionNotFoundError, SessionCompleteError, InvalidReferenceError):
            raise
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                f"Redis backend failed while storing response for session '{session_id}'"
            ) from exc

    def get_session_responses(self, session_id: str) -> List[UserResponse]:
        try:
            session = self._load_session(session_id)
            return session.responses.copy()
        except SessionNotFoundError:
            raise
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                f"Redis backend failed while reading session '{session_id}'"
            ) from exc

    def validate_response_completeness(self, session_id: str) -> bool:
        session = self._load_session(session_id)
        expected_count = self._question_bank_manager.get_question_count()
        return len(session.responses) == expected_count

    def get_session(self, session_id: str) -> SessionModel:
        return self._load_session(session_id)

    def complete_session(self, session_id: str) -> SessionModel:
        try:
            with self._redis_lock(self._session_lock_key(session_id)):
                session = self._load_session(session_id)
                if session.status == SessionStatus.COMPLETED:
                    raise SessionCompleteError(f"Session '{session_id}' is already completed")

                session.status = SessionStatus.COMPLETED
                self._save_session(session)
                self._redis.zrem(self._ACTIVE_SESSIONS_KEY, session_id)
                self._question_bank_manager.unlock_question_bank(session_id)
                return session
        except (SessionNotFoundError, SessionCompleteError):
            raise
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                f"Redis backend failed while completing session '{session_id}'"
            ) from exc

    def get_all_sessions(self) -> List[SessionModel]:
        try:
            sessions: List[SessionModel] = []
            for key in self._redis.scan_iter(match=f"{self._SESSION_KEY_PREFIX}*"):
                payload = self._redis.get(key)
                if payload:
                    sessions.append(SessionModel.model_validate_json(payload))
            return sessions
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                "Redis backend failed while listing sessions"
            ) from exc

    def delete_session(self, session_id: str) -> None:
        try:
            with self._redis_lock(self._session_lock_key(session_id)):
                session = self._load_session(session_id)
                if session.status == SessionStatus.IN_PROGRESS:
                    self._question_bank_manager.unlock_question_bank(session_id)
                self._redis.delete(self._session_key(session_id))
                self._redis.zrem(self._ACTIVE_SESSIONS_KEY, session_id)
        except SessionNotFoundError:
            raise
        except RedisError as exc:
            raise SessionBackendUnavailableError(
                f"Redis backend failed while deleting session '{session_id}'"
            ) from exc
