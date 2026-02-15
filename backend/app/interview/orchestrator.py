"""
IT Career Test Engine Orchestrator v2.1.

Orchestrates the role-first scoring pipeline:
1. Initialize all managers
2. Create test session
3. Present questions and store responses
4. Compute role scores + stage affinity
5. Select winning stage via role-first algorithm
6. Generate LLM interpretation
7. Return results
"""

from typing import List, Dict, Tuple
from dataclasses import dataclass
import os
import logging

from .storage.role_profile_manager import RoleProfileManager
from .storage.signal_dictionary_manager import SignalDictionaryManager
from .storage.question_bank_manager import QuestionBankManager
from .storage.user_response_store import UserResponseStore
from .storage.role_catalog_manager import RoleCatalogManager
from .aggregation.aggregation_engine import AggregationEngine
from .aggregation.stage_aggregation_engine import StageAggregationEngine, StageScoreComputeResult
from .interpretation.llm_interpreter import LLMInterpreter, InterpretationResult
from .models.question import Question

logger = logging.getLogger(__name__)


@dataclass
class CareerTestResult:
    """Complete test result with interpretation and stage recommendation."""
    session_id: str
    ranked_roles: List[Tuple[str, float]]
    signal_profile: Dict[str, int]
    interpretation: InterpretationResult
    stage_result: StageScoreComputeResult = None


class ITCareerTestOrchestrator:
    """Orchestrator for the IT Career Test Engine v2.1."""

    def __init__(self, openai_api_key: str = None, model: str = "gpt-4", enable_llm: bool = True):
        self.role_manager = RoleProfileManager()
        self.signal_manager = SignalDictionaryManager()
        self.question_manager = QuestionBankManager()
        self.response_store = UserResponseStore(self.question_manager)
        self.aggregation_engine = AggregationEngine(self.response_store)
        self.role_catalog_manager = RoleCatalogManager()

        self.llm_interpreter = None
        if enable_llm:
            self.llm_interpreter = LLMInterpreter(api_key=openai_api_key, model=model)

    def get_all_questions(self) -> List[Question]:
        return self.question_manager.get_all_questions()

    def start_test(self) -> str:
        session = self.response_store.create_session()
        return session.session_id

    def submit_answer(self, session_id: str, question_id: str, answer_option_id: str) -> None:
        self.response_store.store_response(session_id, question_id, answer_option_id)

    def complete_test(self, session_id: str, skip_llm: bool = False) -> CareerTestResult:
        """Complete the test: role scores -> role-first stage selection -> LLM interpretation."""
        self.response_store.complete_session(session_id)
        score_result = self.aggregation_engine.compute_scores(session_id)

        # Role-first stage selection
        stage_result = None
        try:
            from .storage.stage_manager import StageManager
            stage_manager = StageManager()
            stage_engine = StageAggregationEngine(
                stage_manager=stage_manager,
                role_catalog_manager=self.role_catalog_manager,
            )
            stage_result = stage_engine.compute_stage_scores(
                ranked_roles=score_result.ranked_roles,
                stage_affinity=score_result.stage_affinity,
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Stage computation failed: {e}")

        # LLM interpretation
        interpretation = None
        if not skip_llm and self.llm_interpreter is not None:
            try:
                role_profiles = {
                    role.id: {
                        'name': role.name,
                        'description': role.description,
                        'key_signals': role.key_signals
                    }
                    for role in self.role_manager.get_all_roles()
                }
                signals = {
                    signal.id: {
                        'name': signal.name,
                        'description': signal.description
                    }
                    for signal in self.signal_manager.get_all_signals()
                }
                interpretation = self.llm_interpreter.interpret_results(
                    ranked_roles=score_result.ranked_roles,
                    signal_profile=score_result.signal_profile,
                    role_profiles=role_profiles,
                    signals=signals
                )
            except Exception as e:
                # LLM is non-critical for the test flow: return deterministic result without interpretation.
                logger.warning(f"LLM interpretation failed, continuing without it: {e}")
                interpretation = None

        return CareerTestResult(
            session_id=session_id,
            ranked_roles=score_result.ranked_roles,
            signal_profile=score_result.signal_profile,
            interpretation=interpretation,
            stage_result=stage_result,
        )

    def run_full_test(self, answers: List[Tuple[str, str]]) -> CareerTestResult:
        session_id = self.start_test()
        for question_id, answer_option_id in answers:
            self.submit_answer(session_id, question_id, answer_option_id)
        return self.complete_test(session_id)


def load_env_file():
    try:
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        value = value.strip().strip("'").strip('"')
                        os.environ[key.strip()] = value
    except Exception as e:
        print(f"Warning: Could not load .env file: {e}")


def main():
    load_env_file()
    print("\n" + "=" * 60)
    print("IT Career Test Engine v2.1")
    print("=" * 60)

    orchestrator = ITCareerTestOrchestrator()
    questions = orchestrator.get_all_questions()
    print(f"\nЗагружено {len(questions)} вопросов.")

    session_id = orchestrator.start_test()
    for i, question in enumerate(questions, 1):
        num_options = len(question.answer_options)
        print(f"\nВопрос {i}/{len(questions)}: [{question.thematic_block}]")
        print(f"{question.text}\n")
        for j, option in enumerate(question.answer_options, 1):
            print(f"  {j}. {option.text}")
        while True:
            try:
                idx = int(input(f"\nВаш выбор (1-{num_options}): ").strip()) - 1
                if 0 <= idx < num_options:
                    orchestrator.submit_answer(session_id, question.id, question.answer_options[idx].id)
                    break
            except ValueError:
                pass

    result = orchestrator.complete_test(session_id)
    print("\nТоп-5 ролей:")
    for i, (role_id, score) in enumerate(result.ranked_roles[:5], 1):
        role = orchestrator.role_manager.get_role(role_id)
        print(f"{i}. {role.name if role else role_id}: {score:.2f}")

    if result.stage_result:
        rec = result.stage_result.recommendation
        print(f"\nЭтап: {rec.primary_stage_name}\n{rec.what_user_will_see}")

if __name__ == "__main__":
    main()
