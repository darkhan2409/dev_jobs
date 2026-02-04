"""
User Response Store for IT Career Test Engine.

Manages test sessions and user responses with semantic context storage
(resolved signals and weights from answer options).

Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
"""

from typing import Dict, List, Optional
from datetime import datetime
from ..models.user_response import UserResponse, SessionModel, SessionStatus
from ..models.question import Question
from .question_bank_manager import QuestionBankManager


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


class UserResponseStore:
    """
    Manages user responses with semantic context storage.
    
    Stores responses with resolved signals and weights from answer options,
    ensuring question bank immutability during active sessions.
    """
    
    def __init__(self, question_bank_manager: QuestionBankManager):
        """
        Initialize the User Response Store.
        
        Args:
            question_bank_manager: QuestionBankManager instance for question lookup
        """
        self._sessions: Dict[str, SessionModel] = {}
        self._question_bank_manager = question_bank_manager
    
    def create_session(self) -> SessionModel:
        """
        Create a new test session.
        
        Locks the question bank to ensure immutability during the session.
        
        Returns:
            SessionModel instance with unique session_id
            
        Validates: Requirements 5.1, 3.7
        """
        # Generate unique session ID
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Lock the question bank for this session
        question_bank_version = self._question_bank_manager.get_version()
        self._question_bank_manager.lock_question_bank(session_id)
        
        # Create session
        session = SessionModel(
            session_id=session_id,
            responses=[],
            status=SessionStatus.IN_PROGRESS,
            locked_question_bank_version=question_bank_version
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
        Store a user response with resolved semantic context.
        
        Resolves and stores signals and weights from the selected answer option
        (denormalization for efficient aggregation).
        
        Args:
            session_id: Test session identifier
            question_id: Question identifier
            answer_option_id: Selected answer option identifier
            
        Returns:
            UserResponse instance with resolved signals and weights
            
        Raises:
            SessionNotFoundError: If session does not exist
            SessionCompleteError: If session is already completed
            QuestionAlreadyAnsweredError: If question already answered in this session
            InvalidReferenceError: If question or answer option ID is invalid
            
        Validates: Requirements 5.1, 5.2, 5.3, 5.4
        """
        # Check session exists
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        session = self._sessions[session_id]
        
        # Check session is not completed
        if session.status == SessionStatus.COMPLETED:
            raise SessionCompleteError(
                f"Cannot add responses to completed session '{session_id}'"
            )
        
        # Check question not already answered
        for response in session.responses:
            if response.question_id == question_id:
                raise QuestionAlreadyAnsweredError(
                    f"Question '{question_id}' already answered in session '{session_id}'"
                )
        
        # Validate question exists
        question = self._question_bank_manager.get_question(question_id)
        if question is None:
            raise InvalidReferenceError(f"Invalid question ID: '{question_id}'")
        
        # Find the selected answer option
        answer_option = None
        for option in question.answer_options:
            if option.id == answer_option_id:
                answer_option = option
                break
        
        if answer_option is None:
            raise InvalidReferenceError(
                f"Invalid answer option ID: '{answer_option_id}' for question '{question_id}'"
            )
        
        # Resolve signals and weights from the answer option (denormalization)
        resolved_signals = answer_option.signal_associations.copy()
        resolved_weights = answer_option.role_weights.copy()
        
        # Create user response with resolved data
        user_response = UserResponse(
            session_id=session_id,
            question_id=question_id,
            answer_option_id=answer_option_id,
            resolved_signals=resolved_signals,
            resolved_weights=resolved_weights,
            timestamp=datetime.now()
        )
        
        # Add response to session
        session.responses.append(user_response)
        
        return user_response
    
    def get_session_responses(self, session_id: str) -> List[UserResponse]:
        """
        Retrieve all responses for a test session.
        
        Args:
            session_id: Test session identifier
            
        Returns:
            List of UserResponse instances for the session
            
        Raises:
            SessionNotFoundError: If session does not exist
            
        Validates: Requirements 5.1
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        return self._sessions[session_id].responses.copy()
    
    def validate_response_completeness(self, session_id: str) -> bool:
        """
        Validate that all 25 questions have been answered.
        
        Args:
            session_id: Test session identifier
            
        Returns:
            True if all 25 questions answered, False otherwise
            
        Raises:
            SessionNotFoundError: If session does not exist
            
        Validates: Requirements 5.5
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        session = self._sessions[session_id]
        return len(session.responses) == 25
    
    def get_session(self, session_id: str) -> SessionModel:
        """
        Retrieve a test session.
        
        Args:
            session_id: Test session identifier
            
        Returns:
            SessionModel instance
            
        Raises:
            SessionNotFoundError: If session does not exist
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        return self._sessions[session_id]
    
    def complete_session(self, session_id: str) -> SessionModel:
        """
        Mark a session as completed.
        
        Args:
            session_id: Test session identifier
            
        Returns:
            Updated SessionModel instance
            
        Raises:
            SessionNotFoundError: If session does not exist
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        session = self._sessions[session_id]
        session.status = SessionStatus.COMPLETED
        
        # Unlock the question bank for this session
        self._question_bank_manager.unlock_question_bank(session_id)
        
        return session
    
    def get_all_sessions(self) -> List[SessionModel]:
        """
        Retrieve all test sessions.
        
        Returns:
            List of all SessionModel instances
        """
        return list(self._sessions.values())
    
    def delete_session(self, session_id: str) -> None:
        """
        Delete a test session.
        
        Args:
            session_id: Test session identifier
            
        Raises:
            SessionNotFoundError: If session does not exist
        """
        if session_id not in self._sessions:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")
        
        # Unlock the question bank if session is still in progress
        session = self._sessions[session_id]
        if session.status == SessionStatus.IN_PROGRESS:
            self._question_bank_manager.unlock_question_bank(session_id)
        
        del self._sessions[session_id]
