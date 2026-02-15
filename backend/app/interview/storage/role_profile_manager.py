"""
Role Profile Manager for IT Career Test Engine v2.1.

Manages the 7 canonical IT role profiles with their characteristics and signal associations.
"""

from typing import Dict, List, Optional
from ..models.role_profile import RoleProfile


class RoleProfileManager:
    """
    Manages IT role profiles with methods for retrieval and validation.

    Stores exactly 7 canonical IT roles for v2.1 career test.
    """

    def __init__(self):
        """Initialize the Role Profile Manager with 7 canonical IT roles."""
        self._roles: Dict[str, RoleProfile] = {}
        self._initialize_roles()

    def _initialize_roles(self) -> None:
        """Initialize the 7 canonical IT role profiles for v2.1."""

        roles_data = [
            {
                "id": "product_manager",
                "name": "Продакт-менеджер",
                "description": "Определяет видение продукта, стратегию и дорожную карту. Фокусируется на потребностях пользователей, целях бизнеса и приоритетах фич.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Определение продуктовой стратегии и видения",
                    "Приоритизация фич и управление бэклогом",
                    "Анализ метрик и принятие data-driven решений",
                    "Коммуникация со стейкхолдерами и командой",
                    "Проведение пользовательских исследований"
                ],
                "typical_stack": ["Jira", "Miro", "Amplitude", "Figma", "SQL (базовый)", "Google Analytics"],
                "red_flags": [
                    "Хочется глубоко кодить",
                    "Не нравится общаться с людьми",
                    "Раздражает неопределённость"
                ],
                "entry_from": [],
                "can_grow_to": [],
                "key_signals": ["big_picture_thinking", "user_empathy", "strategic_thinking", "communication_skills", "data_driven_mindset"],
                "distinguishing_features": "Связующее звено между пользователем, бизнесом и разработкой. Управляет ценностью продукта, а не написанием кода."
            },
            {
                "id": "uiux_designer",
                "name": "UI/UX-дизайнер",
                "description": "Проектирует пользовательский опыт и визуальные интерфейсы. Проводит исследования, создает прототипы и следит за удобством взаимодействия.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Проведение пользовательских исследований",
                    "Создание wireframes и прототипов",
                    "Проектирование UI-компонентов и дизайн-систем",
                    "Юзабилити-тестирование",
                    "Работа с дизайн-токенами и стайл-гайдами"
                ],
                "typical_stack": ["Figma", "Miro", "Hotjar", "Principle", "Adobe XD", "Framer"],
                "red_flags": [
                    "Не интересует поведение пользователей",
                    "Хочется глубоко программировать",
                    "Не нравится визуальная работа"
                ],
                "entry_from": [],
                "can_grow_to": ["product_manager", "frontend_developer"],
                "key_signals": ["user_empathy", "creative_problem_solving", "visual_thinking", "research_mindset", "detail_orientation"],
                "distinguishing_features": "Глубоко погружается в психологию пользователя и визуальный дизайн. Создаёт интерфейсы на основе данных исследований."
            },
            {
                "id": "frontend_developer",
                "name": "Frontend-разработчик",
                "description": "Создает пользовательские интерфейсы и клиентскую часть приложений. Отвечает за визуальное воплощение дизайна, интерактив и адаптивную верстку.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Вёрстка UI по макетам",
                    "Разработка интерактивных компонентов",
                    "Оптимизация производительности UI",
                    "Адаптивный дизайн и кроссбраузерность",
                    "Интеграция с backend API"
                ],
                "typical_stack": ["JavaScript", "TypeScript", "React", "Vue", "CSS/Tailwind", "Figma"],
                "red_flags": [
                    "Не интересует визуальная часть",
                    "Раздражает пиксель-перфект",
                    "Хочется работать только с серверной логикой"
                ],
                "entry_from": [],
                "can_grow_to": ["ui_ux_designer", "backend_developer"],
                "key_signals": ["creative_problem_solving", "user_empathy", "detail_orientation", "visual_thinking", "technical_depth_preference"],
                "distinguishing_features": "Работает с тем, что видит пользователь. Акцент на интерфейсах, клиентской логике и удобстве взаимодействия."
            },
            {
                "id": "backend_developer",
                "name": "Backend-разработчик",
                "description": "Разрабатывает серверную часть приложений, API и системы баз данных. Фокусируется на бизнес-логике, обработке данных и архитектуре систем.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Разработка REST/GraphQL API",
                    "Работа с базами данных (SQL/NoSQL)",
                    "Написание бизнес-логики",
                    "Code review и рефакторинг",
                    "Интеграция с внешними сервисами"
                ],
                "typical_stack": ["Python", "Java", "Go", "PostgreSQL", "Redis", "Docker"],
                "red_flags": [
                    "Не нравится работать с абстрактной логикой",
                    "Предпочитает визуальные результаты кода",
                    "Раздражает отладка невидимых процессов"
                ],
                "entry_from": [],
                "can_grow_to": ["devops_engineer", "ai_data_engineer"],
                "key_signals": ["analytical_thinking", "systematic_approach", "technical_depth_preference", "process_orientation"],
                "distinguishing_features": "Адаптирует серверную логику и проектирует API. Создает бизнес-правила приложения и обеспечивает надёжную обработку данных."
            },
            {
                "id": "ai_data_engineer",
                "name": "AI/Data-инженер",
                "description": "Строит пайплайны данных, создает и внедряет модели машинного обучения. Работает с большими данными, ML-моделями и аналитическими системами.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Разработка ETL/ELT пайплайнов",
                    "Обучение и валидация ML моделей",
                    "Feature engineering и подготовка данных",
                    "Деплой моделей в продакшен",
                    "Мониторинг качества данных и моделей"
                ],
                "typical_stack": ["Python", "SQL", "PyTorch", "Airflow", "Spark", "MLflow", "Docker"],
                "red_flags": [
                    "Не нравится математика и статистика",
                    "Хочется быстрых визуальных результатов",
                    "Раздражает работа с большими объёмами данных"
                ],
                "entry_from": ["backend_developer"],
                "can_grow_to": [],
                "key_signals": ["analytical_thinking", "data_driven_mindset", "experimental_approach", "technical_depth_preference", "systematic_approach"],
                "distinguishing_features": "Объединяет инженерию данных и машинное обучение. Строит архитектуру данных и внедряет ML-модели в продуктовые системы."
            },
            {
                "id": "qa_engineer",
                "name": "QA-инженер",
                "description": "Обеспечивает качество продукта через тестирование и автоматизацию. Ищет баги, предотвращает дефекты и улучшает процессы разработки.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Написание тест-кейсов и тест-планов",
                    "Автоматизация тестирования (UI, API)",
                    "Регрессионное и интеграционное тестирование",
                    "Баг-репорты и tracking",
                    "Участие в code review с фокусом на качество"
                ],
                "typical_stack": ["Python/Java", "Selenium", "Pytest", "Postman", "Jira", "CI/CD"],
                "red_flags": [
                    "Хочется создавать, а не проверять",
                    "Раздражает поиск мелких багов",
                    "Не нравится рутинная проверка сценариев"
                ],
                "entry_from": [],
                "can_grow_to": ["backend_developer", "devops_engineer"],
                "key_signals": ["detail_orientation", "systematic_approach", "critical_thinking", "process_orientation", "analytical_thinking"],
                "distinguishing_features": "Обеспечивает надежность продукта. Акцент на системной проверке сценариев и предотвращении ошибок ещё на этапе проектирования."
            },
            {
                "id": "devops_engineer",
                "name": "DevOps-инженер",
                "description": "Управляет инфраструктурой, процессами деплоя и надежностью систем. Автоматизирует доставку кода и мониторинг.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Настройка CI/CD пайплайнов",
                    "Управление инфраструктурой (IaC)",
                    "Мониторинг и алертинг",
                    "Обеспечение надёжности и отказоустойчивости",
                    "Автоматизация рутинных операций"
                ],
                "typical_stack": ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus", "Linux"],
                "red_flags": [
                    "Не нравится работа с терминалом",
                    "Хочется писать бизнес-логику",
                    "Раздражает инфраструктурная рутина"
                ],
                "entry_from": ["backend_developer", "qa_engineer"],
                "can_grow_to": [],
                "key_signals": ["systematic_approach", "process_orientation", "automation_mindset", "analytical_thinking", "technical_depth_preference"],
                "distinguishing_features": "Связующее звено между разработкой и эксплуатацией платформ. Фокусируется на автоматизации среды и стабильности релизов."
            }
        ]

        for role_data in roles_data:
            role = RoleProfile(**role_data)
            self._roles[role.id] = role

    def get_role(self, role_id: str) -> Optional[RoleProfile]:
        """Retrieve a role profile by its ID."""
        return self._roles.get(role_id)

    def get_all_roles(self) -> List[RoleProfile]:
        """Retrieve all role profiles."""
        return list(self._roles.values())

    def validate_role_uniqueness(self) -> bool:
        """Validate that all role IDs and names are unique."""
        if len(self._roles) != 7:
            return False

        role_ids = [role.id for role in self._roles.values()]
        if len(role_ids) != len(set(role_ids)):
            return False

        role_names = [role.name for role in self._roles.values()]
        if len(role_names) != len(set(role_names)):
            return False

        return True

    def get_role_count(self) -> int:
        """Get the total number of roles."""
        return len(self._roles)
