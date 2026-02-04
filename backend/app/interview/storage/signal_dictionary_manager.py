"""
Signal Dictionary Manager for IT Career Test Engine.

Manages the global dictionary of 12-20 cognitive signals representing thinking styles.

Validates: Requirements 2.1, 2.2, 2.3, 2.4
"""

from typing import Dict, List, Optional
from ..models.signal import Signal


class SignalDictionaryManager:
    """
    Manages cognitive signals with methods for retrieval and validation.
    
    Stores between 12 and 20 cognitive signals representing thinking styles
    (not technical skills).
    """
    
    def __init__(self):
        """Initialize the Signal Dictionary Manager with cognitive signals."""
        self._signals: Dict[str, Signal] = {}
        self._initialize_signals()
    
    def _initialize_signals(self) -> None:
        """Initialize the cognitive signals dictionary."""
        
        # Define cognitive signals representing thinking styles (not technical skills)
        signals_data = [
            {
                "id": "analytical_thinking",
                "name": "Аналитическое мышление",
                "description": "Способность разбивать сложные задачи на составляющие и системно их анализировать",
                "category": "cognitive_style"
            },
            {
                "id": "creative_problem_solving",
                "name": "Креативность в решении задач",
                "description": "Склонность к поиску инновационных и нестандартных способов решения проблем",
                "category": "cognitive_style"
            },
            {
                "id": "systematic_approach",
                "name": "Системный подход",
                "description": "Предпочтение структурированных, методичных процессов и организованных рабочих потоков",
                "category": "work_style"
            },
            {
                "id": "detail_orientation",
                "name": "Внимание к деталям",
                "description": "Фокус на точности и тщательная проработка мелких нюансов",
                "category": "work_style"
            },
            {
                "id": "big_picture_thinking",
                "name": "Масштабное мышление",
                "description": "Способность видеть общие закономерности, стратегические связи и долгосрочные последствия",
                "category": "cognitive_style"
            },
            {
                "id": "user_empathy",
                "name": "Эмпатия к пользователю",
                "description": "Понимание потребностей, опыта и ожиданий конечных пользователей",
                "category": "interpersonal"
            },
            {
                "id": "data_driven_mindset",
                "name": "Опора на данные",
                "description": "Предпочтение решений, основанных на анализе данных и эмпирических доказательствах",
                "category": "decision_making"
            },
            {
                "id": "technical_depth_preference",
                "name": "Глубина технических знаний",
                "description": "Желание глубоко понимать технические концепции и погружаться в детали реализации",
                "category": "learning_style"
            },
            {
                "id": "process_orientation",
                "name": "Ориентация на процессы",
                "description": "Фокус на создании и соблюдении четко определенных процедур",
                "category": "work_style"
            },
            {
                "id": "communication_skills",
                "name": "Навыки коммуникации",
                "description": "Способность ясно объяснять сложные вещи и эффективно сотрудничать с другими",
                "category": "interpersonal"
            },
            {
                "id": "experimental_approach",
                "name": "Экспериментальный подход",
                "description": "Готовность пробовать разные варианты, тестировать гипотезы и учиться на ошибках",
                "category": "learning_style"
            },
            {
                "id": "visual_thinking",
                "name": "Визуальное мышление",
                "description": "Склонность мыслить образами, макетами и пространственными связями",
                "category": "cognitive_style"
            },
            {
                "id": "critical_thinking",
                "name": "Критическое мышление",
                "description": "Способность объективно оценивать информацию и выявлять потенциальные риски",
                "category": "cognitive_style"
            },
            {
                "id": "strategic_thinking",
                "name": "Стратегическое мышление",
                "description": "Умение планировать долгосрочные цели и соотносить решения с общими задачами",
                "category": "decision_making"
            },
            {
                "id": "automation_mindset",
                "name": "Тяга к автоматизации",
                "description": "Стремление автоматизировать рутину и повышать эффективность через инструменты",
                "category": "work_style"
            },
            {
                "id": "risk_assessment",
                "name": "Оценка рисков",
                "description": "Способность выявлять, оценивать и минимизировать потенциальные риски и уязвимости",
                "category": "decision_making"
            },
            {
                "id": "platform_thinking",
                "name": "Платформенное мышление",
                "description": "Понимание специфики, возможностей и ограничений конкретных платформ",
                "category": "cognitive_style"
            },
            {
                "id": "performance_optimization",
                "name": "Оптимизация производительности",
                "description": "Фокус на эффективности, скорости и рациональном использовании ресурсов",
                "category": "work_style"
            },
            {
                "id": "research_mindset",
                "name": "Исследовательский подход",
                "description": "Системный сбор информации, проверка предположений и валидация выводов",
                "category": "learning_style"
            },
            {
                "id": "linguistic_thinking",
                "name": "Лингвистическое мышление",
                "description": "Чувствительность к языковым паттернам, семантике и концепциям обработки текста",
                "category": "cognitive_style"
            }
        ]
        
        # Create Signal instances and store them
        for signal_data in signals_data:
            signal = Signal(**signal_data)
            self._signals[signal.id] = signal
    
    def get_signal(self, signal_id: str) -> Optional[Signal]:
        """
        Retrieve a signal by its ID.
        
        Args:
            signal_id: The unique identifier of the signal
            
        Returns:
            Signal if found, None otherwise
        """
        return self._signals.get(signal_id)
    
    def get_all_signals(self) -> List[Signal]:
        """
        Retrieve all signals.
        
        Returns:
            List of all Signal instances
        """
        return list(self._signals.values())
    
    def validate_signal_count(self) -> bool:
        """
        Validate that the signal count is between 12 and 20.
        
        Returns:
            True if signal count is in valid range [12, 20], False otherwise
        """
        signal_count = len(self._signals)
        return 12 <= signal_count <= 20
    
    def validate_signal_uniqueness(self) -> bool:
        """
        Validate that all signal IDs and names are unique.
        
        Returns:
            True if all signals have unique IDs and names, False otherwise
        """
        # Check ID uniqueness (already guaranteed by dict keys, but verify)
        signal_ids = [signal.id for signal in self._signals.values()]
        if len(signal_ids) != len(set(signal_ids)):
            return False
        
        # Check name uniqueness
        signal_names = [signal.name for signal in self._signals.values()]
        if len(signal_names) != len(set(signal_names)):
            return False
        
        return True
    
    def get_signal_count(self) -> int:
        """
        Get the total number of signals.
        
        Returns:
            Number of signals stored
        """
        return len(self._signals)
