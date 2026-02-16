"""
User Response Store for IT Career Test Engine v2.1.

Manages test sessions and user responses with semantic context storage
(resolved signals, role weights, and stage weights from answer options).
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from uuid import uuid4
from ..models.user_response import UserResponse, SessionModel, SessionStatus
from .question_bank_manager import QuestionBankManager
from .session_store import SessionStore, SessionLimitExceededError
from app.config import settings


class UserResponseStoreError(Exception):
    """Base exception for User Response Store errors."""
    pass


class SessionNotFoundError(UserResponseStoreError):
    """Raised when a session is not found."""
    pass


class QuestionAlreadyAnsweredError(UserResponseStoreError):
    """Raised when attempting to answer the same question twice in a session."""
    pass


class InvalidReferenceError(UserResponseStoreError):
    """Raised when a question or answer option ID is invalid."""
    pass


class SessionCompleteError(UserResponseStoreError):
    """Raised when attempting to add responses to a completed session."""
    pass


class UserResponseStore(SessionStore):
    """
    Manages user responses with semantic context storage.

    Stores responses with resolved signals, role weights, and stage weights
    from answer options (denormalization for efficient aggregation).
    """

    def __init__(
        self,
        question_bank_manager: QuestionBankManager,
        max_active_sessions: Optional[int] = None
    ):
        self._sessions: Dict[str, SessionModel] = {}
        self._question_bank_manager = question_bank_manager
        self._max_active_sessions = (
            max_active_sessions
            if max_active_sessions is not None
            else settings.INTERVIEW_SESSION_MAX_ACTIVE
        )

    def _evict_expired_sessions(self, current_session_id: Optional[str] = None) -> None:
        """Remove expired sessions from memory."""
        now = datetime.now()
        for session_id, session in list(self._sessions.items()):
            if session.expires_at and now >= session.expires_at:
                if session.status == SessionStatus.IN_PROGRESS:
                    self._question_bank_manager.unlock_question_bank(session_id)
                del self._sessions[session_id]
                if current_session_id and session_id == current_session_id:
                    raise SessionNotFoundError("Session expired")

    def create_session(self) -> SessionModel:
        """Create a new test session."""
        self._evict_expired_sessions()

        active_sessions = sum(
            1
            for session in self._sessions.values()
            if session.status == SessionStatus.IN_PROGRESS
        )
        if active_sessions >= self._max_active_sessions:
            raise SessionLimitExceededError("Too many active interview sessions")

        session_id = f"session_{uuid4()}"
        created_at = datetime.now()
        expires_at = created_at + timedelta(minutes=settings.CAREER_SESSION_TTL_MINUTES)

        question_bank_version = self._question_bank_manager.get_version()
        self._question_bank_manager.lock_question_bank(session_id)

        session = SessionModel(
            session_id=session_id,
            responses=[],
            status=SessionStatus.IN_PROGRESS,
            locked_question_bank_version=question_bank_version,
            created_at=created_at,
            expires_at=expires_at
        )

        self._sessions[session_id] = session
        return session

    def store_response(
        self,
        session_id: str,
        question_id: str,
        answer_option_id: str
    ) -> UserResponse:
        """
        Store or update a user response with resolved semantic context.

        Resolves and stores signals, role weights, and stage weights
        from the selected answer option. If the question was already answered
        in the same in-progress session, the previous response is overwritten.
        """
        self._evict_expired_sessions(session_id)

        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")

        session = self._sessions[session_id]

        if session.status == SessionStatus.COMPLETED:
            raise SessionCompleteError(
                f"Cannot add responses to completed session '{session_id}'"
            )

        existing_response_index = None
        for idx, response in enumerate(session.responses):
            if response.question_id == question_id:
                existing_response_index = idx
                break

        question = self._question_bank_manager.get_question(question_id)
        if question is None:
            raise InvalidReferenceError(f"Invalid question ID: '{question_id}'")

        answer_option = None
        for option in question.answer_options:
            if option.id == answer_option_id:
                answer_option = option
                break

        if answer_option is None:
            raise InvalidReferenceError(
                f"Invalid answer option ID: '{answer_option_id}' for question '{question_id}'"
            )

        # Resolve signals, role weights, and stage weights from the answer option
        resolved_signals = answer_option.signal_associations.copy()
        resolved_weights = answer_option.role_weights.copy()
        resolved_stage_weights = answer_option.stage_weights.copy()

        user_response = UserResponse(
            session_id=session_id,
            question_id=question_id,
            answer_option_id=answer_option_id,
            resolved_signals=resolved_signals,
            resolved_weights=resolved_weights,
            resolved_stage_weights=resolved_stage_weights,
            timestamp=datetime.now()
        )

        if existing_response_index is not None:
            session.responses[existing_response_index] = user_response
        else:
            session.responses.append(user_response)
        return user_response

    def get_session_responses(self, session_id: str) -> List[UserResponse]:
        """Retrieve all responses for a test session."""
        self._evict_expired_sessions(session_id)
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        return self._sessions[session_id].responses.copy()

    def validate_response_completeness(self, session_id: str) -> bool:
        """Validate that all questions have been answered (dynamic count)."""
        self._evict_expired_sessions(session_id)
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")

        session = self._sessions[session_id]
        expected_count = self._question_bank_manager.get_question_count()
        return len(session.responses) == expected_count

    def get_session(self, session_id: str) -> SessionModel:
        """Retrieve a test session."""
        self._evict_expired_sessions(session_id)
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        return self._sessions[session_id]

    def complete_session(self, session_id: str) -> SessionModel:
        """Mark a session as completed."""
        self._evict_expired_sessions(session_id)
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")

        session = self._sessions[session_id]
        if session.status == SessionStatus.COMPLETED:
            raise SessionCompleteError(
                f"Session '{session_id}' is already completed"
            )
        session.status = SessionStatus.COMPLETED
        self._question_bank_manager.unlock_question_bank(session_id)
        return session

    def get_all_sessions(self) -> List[SessionModel]:
        """Retrieve all test sessions."""
        self._evict_expired_sessions()
        return list(self._sessions.values())

    def delete_session(self, session_id: str) -> None:
        """Delete a test session."""
        self._evict_expired_sessions(session_id)
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")

        session = self._sessions[session_id]
        if session.status == SessionStatus.IN_PROGRESS:
            self._question_bank_manager.unlock_question_bank(session_id)

        del self._sessions[session_id]
