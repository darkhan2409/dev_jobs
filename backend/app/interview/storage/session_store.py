"""
Session store abstractions for interview runtime backends.
"""

from abc import ABC, abstractmethod
from typing import List

from ..models.user_response import SessionModel, UserResponse


class SessionStoreError(Exception):
    """Base exception for session backend errors."""


class SessionLimitExceededError(SessionStoreError):
    """Raised when the active session limit is reached."""


class SessionBackendUnavailableError(SessionStoreError):
    """Raised when the configured session backend cannot be used."""


class SessionStore(ABC):
    """Storage contract for interview sessions."""

    @abstractmethod
    def create_session(self) -> SessionModel:
        raise NotImplementedError

    @abstractmethod
    def store_response(self, session_id: str, question_id: str, answer_option_id: str) -> UserResponse:
        raise NotImplementedError

    @abstractmethod
    def get_session_responses(self, session_id: str) -> List[UserResponse]:
        raise NotImplementedError

    @abstractmethod
    def validate_response_completeness(self, session_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    def get_session(self, session_id: str) -> SessionModel:
        raise NotImplementedError

    @abstractmethod
    def complete_session(self, session_id: str) -> SessionModel:
        raise NotImplementedError

    @abstractmethod
    def get_all_sessions(self) -> List[SessionModel]:
        raise NotImplementedError

    @abstractmethod
    def delete_session(self, session_id: str) -> None:
        raise NotImplementedError
