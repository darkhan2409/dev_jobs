"""
IT Career Test Engine Orchestrator (MVP VERSION - SIMPLE).

Simple orchestrator that ties all components together for end-to-end flow:
1. Initialize all managers
2. Create test session
3. Present questions and store responses
4. Compute scores
5. Generate LLM interpretation
6. Return results

NO extensive logging, NO complex configuration, MINIMAL error handling.
JUST MAKE IT WORK END-TO-END.

Validates: All requirements (integration)
"""

from typing import List, Dict, Tuple
from dataclasses import dataclass
import os

from .storage.role_profile_manager import RoleProfileManager
from .storage.signal_dictionary_manager import SignalDictionaryManager
from .storage.question_bank_manager import QuestionBankManager
from .storage.user_response_store import UserResponseStore
from .aggregation.aggregation_engine import AggregationEngine
from .interpretation.llm_interpreter import LLMInterpreter, InterpretationResult
from .models.question import Question


@dataclass
class CareerTestResult:
    """Complete test result with interpretation."""
    session_id: str
    ranked_roles: List[Tuple[str, float]]  # (role_id, score)
    signal_profile: Dict[str, int]  # signal_id -> count
    interpretation: InterpretationResult


class ITCareerTestOrchestrator:
    """
    Simple orchestrator for the IT Career Test Engine.
    
    Coordinates all components to provide end-to-end test flow.
    """
    
    def __init__(self, openai_api_key: str = None, model: str = "gpt-4", enable_llm: bool = True):
        """
        Initialize the orchestrator with all managers.
        
        Args:
            openai_api_key: OpenAI API key for LLM interpretation (optional, uses env var if not provided)
            model: OpenAI model to use for interpretation (default: gpt-4)
            enable_llm: Whether to enable LLM interpreter (default: True, set to False for testing without API key)
        """
        # Initialize all managers
        self.role_manager = RoleProfileManager()
        self.signal_manager = SignalDictionaryManager()
        self.question_manager = QuestionBankManager()
        self.response_store = UserResponseStore(self.question_manager)
        self.aggregation_engine = AggregationEngine(self.response_store)
        
        # Initialize LLM interpreter only if enabled
        self.llm_interpreter = None
        if enable_llm:
            self.llm_interpreter = LLMInterpreter(api_key=openai_api_key, model=model)
    
    def get_all_questions(self) -> List[Question]:
        """
        Get all 25 questions for the test.
        
        Returns:
            List of all Question instances in order
        """
        return self.question_manager.get_all_questions()
    
    def start_test(self) -> str:
        """
        Start a new test session.
        
        Returns:
            Session ID for the new test session
        """
        session = self.response_store.create_session()
        return session.session_id
    
    def submit_answer(self, session_id: str, question_id: str, answer_option_id: str) -> None:
        """
        Submit an answer for a question.
        
        Args:
            session_id: Test session identifier
            question_id: Question identifier
            answer_option_id: Selected answer option identifier
        """
        self.response_store.store_response(session_id, question_id, answer_option_id)
    
    def complete_test(self, session_id: str, skip_llm: bool = False) -> CareerTestResult:
        """
        Complete the test and get results with interpretation.
        
        This is the main end-to-end flow:
        1. Validate all questions answered
        2. Compute scores
        3. Generate LLM interpretation (if enabled)
        4. Return complete results
        
        Args:
            session_id: Test session identifier
            skip_llm: Skip LLM interpretation (for testing without API key)
            
        Returns:
            CareerTestResult with ranked roles, signal profile, and interpretation
        """
        # Mark session as complete
        self.response_store.complete_session(session_id)
        
        # Compute scores
        score_result = self.aggregation_engine.compute_scores(session_id)
        
        # Generate LLM interpretation if enabled
        interpretation = None
        if not skip_llm and self.llm_interpreter is not None:
            # Prepare data for LLM interpretation
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
            
            # Generate LLM interpretation
            interpretation = self.llm_interpreter.interpret_results(
                ranked_roles=score_result.ranked_roles,
                signal_profile=score_result.signal_profile,
                role_profiles=role_profiles,
                signals=signals
            )
        
        # Return complete results
        return CareerTestResult(
            session_id=session_id,
            ranked_roles=score_result.ranked_roles,
            signal_profile=score_result.signal_profile,
            interpretation=interpretation
        )
    
    def run_full_test(self, answers: List[Tuple[str, str]]) -> CareerTestResult:
        """
        Run a complete test with pre-defined answers (for testing/demo).
        
        Args:
            answers: List of (question_id, answer_option_id) tuples for all 25 questions
            
        Returns:
            CareerTestResult with complete interpretation
        """
        # Start test
        session_id = self.start_test()
        
        # Submit all answers
        for question_id, answer_option_id in answers:
            self.submit_answer(session_id, question_id, answer_option_id)
        
        # Complete and get results
        return self.complete_test(session_id)



def load_env_file():
    """Load environment variables from .env file."""
    try:
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        # Remove quotes if present
                        value = value.strip().strip("'").strip('"')
                        os.environ[key.strip()] = value
    except Exception as e:
        print(f"Warning: Could not load .env file: {e}")


def main():
    """
    Interactive CLI for the IT Career Test.
    """
    # Load .env file
    load_env_file()

    print("\n" + "=" * 60)
    print("IT Career Test Engine - Интерактивный режим")
    print("=" * 60)
    
    # Initialize orchestrator
    orchestrator = ITCareerTestOrchestrator()
    
    # Get all questions
    questions = orchestrator.get_all_questions()
    print(f"\nЗагружено {len(questions)} вопросов из {len(set(q.thematic_block for q in questions))} тематических блоков.")
    print("Пожалуйста, ответьте на каждый вопрос, выбрав вариант (1-4).")
    print("-" * 60)
    
    # Start a test session
    session_id = orchestrator.start_test()
    # print(f"Session ID: {session_id}")
    
    # Interactive loop
    for i, question in enumerate(questions, 1):
        print(f"\nВопрос {i}/{len(questions)}: [{question.thematic_block}]")
        print(f"{question.text}")
        print()
        
        for j, option in enumerate(question.answer_options, 1):
            print(f"  {j}. {option.text}")
        
        while True:
            try:
                choice = input("\nВаш выбор (1-4): ").strip()
                if choice in ['1', '2', '3', '4']:
                    idx = int(choice) - 1
                    answer_option = question.answer_options[idx]
                    orchestrator.submit_answer(session_id, question.id, answer_option.id)
                    break
                else:
                    print("Пожалуйста, введите число от 1 до 4.")
            except ValueError:
                print("Некорректный ввод.")
                
    print("\n" + "=" * 60)
    print("Тест завершен! Обработка результатов...")
    print("=" * 60)

    # Complete test and get results
    try:
        result = orchestrator.complete_test(session_id)
        
        # Display results
        print("\nРЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ")
        print("=" * 30)
        
        print("\nТоп-5 подходящих ролей:")
        for i, (role_id, score) in enumerate(result.ranked_roles[:5], 1):
            role = orchestrator.role_manager.get_role(role_id)
            print(f"{i}. {role.name}: {score:.2f}")
        
        print("\nТоп-5 ваших сигналов мышления:")
        sorted_signals = sorted(result.signal_profile.items(), key=lambda x: x[1], reverse=True)
        for i, (signal_id, count) in enumerate(sorted_signals[:5], 1):
            signal = orchestrator.signal_manager.get_signal(signal_id)
            print(f"{i}. {signal.name}: {count}")
        
        if result.interpretation:
            print("\n" + "=" * 60)
            print("ИНТЕРПРЕТАЦИЯ (AI)")
            print("=" * 60)
            
            print(f"\nОСНОВНАЯ РЕКОМЕНДАЦИЯ: {result.interpretation.primary_recommendation}")
            print(f"\nОБЪЯСНЕНИЕ:\n{result.interpretation.explanation}")
            print(f"\nАНАЛИЗ СИГНАЛОВ:\n{result.interpretation.signal_analysis}")
            
            if result.interpretation.alternative_roles:
                print(f"\nАльтернативные роли: {', '.join(result.interpretation.alternative_roles)}")
            
            if result.interpretation.differentiation_criteria:
                print(f"\nКритерии выбора:\n{result.interpretation.differentiation_criteria}")
        else:
            print("\nИнтерпретация не сгенерирована (отключена или ошибка API).")
            
        print("\n" + "=" * 60)
        print("Спасибо за прохождение теста!")

    except Exception as e:
        print(f"\nОшибка при обработке результатов: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
