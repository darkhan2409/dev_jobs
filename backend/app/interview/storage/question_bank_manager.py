"""
Question Bank Manager for IT Career Test Engine.

Manages 25 questions organized into 6 thematic blocks with immutability
mechanism for active test sessions.

Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
"""

import json
import os
from typing import Dict, List, Optional, Set
from ..models.question import Question, AnswerOption


class QuestionBankError(Exception):
    """Base exception for Question Bank errors."""
    pass


class QuestionDataLoadError(QuestionBankError):
    """Raised when question data cannot be loaded."""
    pass


class QuestionBankManager:
    """
    Manages the question bank with methods for retrieval and validation.

    Stores exactly 25 questions across 6 thematic blocks with immutability
    support during active test sessions.
    """

    # Default path to questions data file (relative to this file's directory)
    DEFAULT_QUESTIONS_FILE = "questions_data.json"

    def __init__(self, questions_file: Optional[str] = None):
        """
        Initialize the Question Bank Manager.

        Args:
            questions_file: Optional path to JSON file with questions data.
                          If not provided, uses default questions_data.json in same directory.
        """
        self._questions: Dict[str, Question] = {}
        self._locked_sessions: Set[str] = set()
        self._version: str = "v1.0"
        self._questions_file = questions_file or self._get_default_questions_path()
        self._load_questions()

    def _get_default_questions_path(self) -> str:
        """Get the default path to questions_data.json."""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(current_dir, self.DEFAULT_QUESTIONS_FILE)

    def _load_questions(self) -> None:
        """
        Load questions from JSON file.

        Raises:
            QuestionDataLoadError: If file cannot be read or parsed
        """
        try:
            with open(self._questions_file, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise QuestionDataLoadError(f"Questions file not found: {self._questions_file}")
        except json.JSONDecodeError as e:
            raise QuestionDataLoadError(f"Invalid JSON in questions file: {e}")
        except Exception as e:
            raise QuestionDataLoadError(f"Error loading questions file: {e}")

        # Extract version if present
        if 'version' in data:
            self._version = data['version']

        # Load questions
        questions_data = data.get('questions', [])
        if not questions_data:
            raise QuestionDataLoadError("No questions found in data file")

        self._initialize_questions(questions_data)

    def _initialize_questions(self, questions_data: List[dict]) -> None:
        """
        Initialize questions from loaded data.

        Args:
            questions_data: List of question dictionaries from JSON
        """
        for question_data in questions_data:
            # Convert answer options to AnswerOption instances
            answer_options = [
                AnswerOption(**opt)
                for opt in question_data["answer_options"]
            ]
            question_dict = {
                "id": question_data["id"],
                "text": question_data["text"],
                "thematic_block": question_data["thematic_block"],
                "answer_options": answer_options
            }
            question = Question(**question_dict)
            self._questions[question.id] = question

    def get_question(self, question_id: str) -> Optional[Question]:
        """
        Retrieve a question by its ID.

        Args:
            question_id: The unique identifier of the question

        Returns:
            Question if found, None otherwise
        """
        return self._questions.get(question_id)

    def get_questions_by_block(self, block: str) -> List[Question]:
        """
        Retrieve all questions from a specific thematic block.

        Args:
            block: The thematic block name

        Returns:
            List of Question instances from the specified block
        """
        return [q for q in self._questions.values() if q.thematic_block == block]

    def get_all_questions(self) -> List[Question]:
        """
        Retrieve all questions in order.

        Returns:
            List of all 25 Question instances
        """
        # Return questions in order by ID (q1, q2, ..., q25)
        sorted_ids = sorted(self._questions.keys(), key=lambda x: int(x[1:]))
        return [self._questions[qid] for qid in sorted_ids]

    def validate_question_quality(self) -> bool:
        """
        Validate that questions meet quality requirements.

        Checks:
        - Exactly 25 questions
        - Questions organized into 6 thematic blocks
        - Each question has exactly 4 answer options
        - No duplicate question IDs

        Returns:
            True if all quality checks pass, False otherwise
        """
        # Check question count
        if len(self._questions) != 25:
            return False

        # Check that we have exactly 6 thematic blocks
        blocks = set(q.thematic_block for q in self._questions.values())
        if len(blocks) != 6:
            return False

        # Check each question has exactly 4 answer options
        for question in self._questions.values():
            if len(question.answer_options) != 4:
                return False

        # Check ID uniqueness (already guaranteed by dict, but verify)
        question_ids = [q.id for q in self._questions.values()]
        if len(question_ids) != len(set(question_ids)):
            return False

        return True

    def lock_question_bank(self, session_id: str) -> None:
        """
        Lock the question bank for a test session to ensure immutability.

        Args:
            session_id: The test session identifier
        """
        self._locked_sessions.add(session_id)

    def unlock_question_bank(self, session_id: str) -> None:
        """
        Unlock the question bank after a test session completes.

        Args:
            session_id: The test session identifier
        """
        self._locked_sessions.discard(session_id)

    def is_locked(self, session_id: str) -> bool:
        """
        Check if the question bank is locked for a specific session.

        Args:
            session_id: The test session identifier

        Returns:
            True if locked for this session, False otherwise
        """
        return session_id in self._locked_sessions

    def has_active_locks(self) -> bool:
        """
        Check if there are any active session locks.

        Returns:
            True if any sessions have locked the question bank, False otherwise
        """
        return len(self._locked_sessions) > 0

    def get_version(self) -> str:
        """
        Get the current version of the question bank.

        Returns:
            Version string
        """
        return self._version

    def get_question_count(self) -> int:
        """
        Get the total number of questions.

        Returns:
            Number of questions stored
        """
        return len(self._questions)

    def get_thematic_blocks(self) -> List[str]:
        """
        Get all unique thematic block names.

        Returns:
            List of thematic block names
        """
        blocks = sorted(set(q.thematic_block for q in self._questions.values()))
        return blocks

    def reload_questions(self, questions_file: Optional[str] = None) -> None:
        """
        Reload questions from file.

        Args:
            questions_file: Optional new path to questions file.
                          If not provided, reloads from current file.

        Raises:
            QuestionBankError: If there are active locks
            QuestionDataLoadError: If file cannot be loaded
        """
        if self.has_active_locks():
            raise QuestionBankError(
                "Cannot reload questions while sessions are active. "
                f"Active sessions: {len(self._locked_sessions)}"
            )

        if questions_file:
            self._questions_file = questions_file

        self._questions.clear()
        self._load_questions()
