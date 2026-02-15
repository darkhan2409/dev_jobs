"""
Question Bank Manager for IT Career Test Engine v2.1.

Manages 20 questions with Likert-5 and forced-choice types.
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

    v2.1: Supports variable option counts (Likert-5 = 5 options, forced-choice = 2 options).
    """

    DEFAULT_QUESTIONS_FILE = "questions_data.json"

    def __init__(self, questions_file: Optional[str] = None):
        self._questions: Dict[str, Question] = {}
        self._locked_sessions: Set[str] = set()
        self._version: str = "v2.1"
        self._questions_file = questions_file or self._get_default_questions_path()
        self._load_questions()

    def _get_default_questions_path(self) -> str:
        """Get the default path to questions_data.json."""
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(current_dir, self.DEFAULT_QUESTIONS_FILE)

    def _load_questions(self) -> None:
        """Load questions from JSON file."""
        try:
            with open(self._questions_file, 'r', encoding='utf-8-sig') as f:
                data = json.load(f)
        except FileNotFoundError:
            raise QuestionDataLoadError(f"Questions file not found: {self._questions_file}")
        except json.JSONDecodeError as e:
            raise QuestionDataLoadError(f"Invalid JSON in questions file: {e}")
        except Exception as e:
            raise QuestionDataLoadError(f"Error loading questions file: {e}")

        if 'version' in data:
            self._version = data['version']

        questions_data = data.get('questions', [])
        if not questions_data:
            raise QuestionDataLoadError("No questions found in data file")

        self._initialize_questions(questions_data)

    def _initialize_questions(self, questions_data: List[dict]) -> None:
        """
        Initialize questions from loaded data.
        Handles v2.1 JSON format: prompt->text, category->thematic_block,
        options->answer_options, label->text.
        """
        for question_data in questions_data:
            # Map v2.1/v4.0 field names to model field names
            q_text = question_data.get("prompt") or question_data.get("text", "")
            q_block = question_data.get("category") or question_data.get("thematic_block", "general")
            q_type = question_data.get("type")
            q_reverse = question_data.get("is_reverse_keyed", False)
            q_forced = question_data.get("forced_choice_priority", False)

            # Convert answer options (v2.1 uses "options" with "label", v1 uses "answer_options" with "text")
            raw_options = question_data.get("options") or question_data.get("answer_options", [])
            answer_options = []
            for opt in raw_options:
                opt_text = opt.get("label") or opt.get("text", "")
                opt_id = opt.get("id", "")
                answer_options.append(AnswerOption(
                    id=opt_id,
                    text=opt_text,
                    signal_associations=opt.get("signal_associations", []),
                    role_weights=opt.get("role_weights", {}),
                    stage_weights=opt.get("stage_weights", {}),
                ))

            question = Question(
                id=question_data["id"],
                text=q_text,
                thematic_block=q_block,
                answer_options=answer_options,
                type=q_type,
                is_reverse_keyed=q_reverse,
                forced_choice_priority=q_forced,
            )
            self._questions[question.id] = question

    def get_question(self, question_id: str) -> Optional[Question]:
        """Retrieve a question by its ID."""
        return self._questions.get(question_id)

    def get_questions_by_block(self, block: str) -> List[Question]:
        """Retrieve all questions from a specific thematic block."""
        return [q for q in self._questions.values() if q.thematic_block == block]

    def get_all_questions(self) -> List[Question]:
        """Retrieve all questions in order."""
        sorted_ids = sorted(self._questions.keys(), key=lambda x: int(x[1:]))
        return [self._questions[qid] for qid in sorted_ids]

    def validate_question_quality(self) -> bool:
        """Validate that questions meet quality requirements."""
        if len(self._questions) == 0:
            return False
        for question in self._questions.values():
            if len(question.answer_options) < 2:
                return False
        return True

    def lock_question_bank(self, session_id: str) -> None:
        """Lock the question bank for a test session."""
        self._locked_sessions.add(session_id)

    def unlock_question_bank(self, session_id: str) -> None:
        """Unlock the question bank after a test session completes."""
        self._locked_sessions.discard(session_id)

    def is_locked(self, session_id: str) -> bool:
        """Check if the question bank is locked for a specific session."""
        return session_id in self._locked_sessions

    def has_active_locks(self) -> bool:
        """Check if there are any active session locks."""
        return len(self._locked_sessions) > 0

    def get_version(self) -> str:
        """Get the current version of the question bank."""
        return self._version

    def get_question_count(self) -> int:
        """Get the total number of questions."""
        return len(self._questions)

    def get_thematic_blocks(self) -> List[str]:
        """Get all unique thematic block names."""
        blocks = sorted(set(q.thematic_block for q in self._questions.values()))
        return blocks

    def reload_questions(self, questions_file: Optional[str] = None) -> None:
        """Reload questions from file."""
        if self.has_active_locks():
            raise QuestionBankError(
                "Cannot reload questions while sessions are active. "
                f"Active sessions: {len(self._locked_sessions)}"
            )
        if questions_file:
            self._questions_file = questions_file
        self._questions.clear()
        self._load_questions()
