"""
Role Profile Manager for IT Career Test Engine.

Manages the 14 canonical IT role profiles with their characteristics and signal associations.

Validates: Requirements 1.1, 1.2, 1.3, 1.4
"""

from typing import Dict, List, Optional
from ..models.role_profile import RoleProfile


class RoleProfileManager:
    """
    Manages IT role profiles with methods for retrieval and validation.
    
    Stores exactly 14 canonical IT roles with descriptions, key signals,
    and distinguishing features for similar role pairs.
    """
    
    def __init__(self):
        """Initialize the Role Profile Manager with 14 canonical IT roles."""
        self._roles: Dict[str, RoleProfile] = {}
        self._initialize_roles()
    
    def _initialize_roles(self) -> None:
        """Initialize the 16 canonical IT role profiles."""
        
        # Define the 16 canonical IT roles (Extended for Career Pipeline v2.0)
        roles_data = [
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
                    "Предпочитает визуальные результаты кода"
                ],
                "entry_from": [],
                "can_grow_to": ["systems_architect", "devops_engineer", "fullstack_developer"],
                "key_signals": ["analytical_thinking", "systematic_approach", "technical_depth_preference", "process_orientation"],
                "distinguishing_features": "Адаптирует серверную логику и проектирует API. В отличие от Data Engineer, который фокусируется на пайплайнах данных, бэкенд-разработчик создает бизнес-правила приложения."
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
                    "Адаптивный дизайн"
                ],
                "typical_stack": ["JavaScript", "TypeScript", "React", "Vue", "CSS", "Figma"],
                "red_flags": [
                    "Не интересует визуальная часть",
                    "Раздражает пиксель-перфект"
                ],
                "entry_from": [],
                "can_grow_to": ["fullstack_developer", "mobile_developer", "ui_ux_researcher"],
                "key_signals": ["creative_problem_solving", "user_empathy", "detail_orientation", "visual_thinking"],
                "distinguishing_features": "Работает с тем, что видит пользователь. Акцент на интерфейсах, клиентской логике и удобстве взаимодействия."
            },
            {
                "id": "fullstack_developer",
                "name": "Fullstack-разработчик",
                "description": "Разрабатывает и frontend, и backend части приложений. Универсальный специалист, востребованный в стартапах и продуктовых командах.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Разработка полного цикла фич (UI + API)",
                    "Работа с базами данных",
                    "Деплой и поддержка приложений",
                    "Быстрое прототипирование"
                ],
                "typical_stack": ["JavaScript/TypeScript", "Node.js", "React/Vue", "PostgreSQL", "Docker"],
                "red_flags": [
                    "Хочется глубокой специализации",
                    "Не нравится переключаться между задачами"
                ],
                "entry_from": ["frontend_developer", "backend_developer"],
                "can_grow_to": ["systems_architect", "product_manager"],
                "key_signals": ["analytical_thinking", "creative_problem_solving", "user_empathy", "systematic_approach"],
                "distinguishing_features": "Сочетает навыки фронтенда и бэкенда. Выбирает широту компетенций вместо узкой специализации."
            },
            {
                "id": "ml_engineer",
                "name": "ML-инженер",
                "description": "Создает и внедряет модели машинного обучения. Занимается обучением, оптимизацией и интеграцией алгоритмов в реальные продукты.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Обучение и валидация ML моделей",
                    "Feature engineering",
                    "Деплой моделей в продакшен",
                    "Мониторинг качества моделей"
                ],
                "typical_stack": ["Python", "PyTorch", "TensorFlow", "scikit-learn", "MLflow", "Docker"],
                "red_flags": [
                    "Не нравится математика и статистика",
                    "Хочется быстрых результатов"
                ],
                "entry_from": ["data_analyst", "data_engineer", "backend_developer"],
                "can_grow_to": ["llm_engineer", "systems_architect"],
                "key_signals": ["analytical_thinking", "data_driven_mindset", "experimental_approach", "technical_depth_preference"],
                "distinguishing_features": "Работает с классическим машинным обучением (классификация, регрессия). В отличие от LLM-инженера, использует широкий спектр алгоритмов и статистических методов."
            },
            {
                "id": "llm_engineer",
                "name": "LLM-инженер",
                "description": "Специализируется на больших языковых моделях (LLM), промпт-инжиниринге и обработке естественного языка. Разрабатывает RAG-системы и интегрирует ИИ в продукты.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Prompt engineering и оптимизация",
                    "Разработка RAG-систем",
                    "Fine-tuning LLM моделей",
                    "Интеграция LLM в продукты"
                ],
                "typical_stack": ["Python", "LangChain", "OpenAI API", "Hugging Face", "Vector DBs", "FastAPI"],
                "red_flags": [
                    "Не интересует NLP и текст",
                    "Хочется работать с табличными данными"
                ],
                "entry_from": ["ml_engineer", "backend_developer", "data_engineer"],
                "can_grow_to": ["ml_engineer", "systems_architect"],
                "key_signals": ["analytical_thinking", "creative_problem_solving", "linguistic_thinking", "experimental_approach"],
                "distinguishing_features": "Узко специализируется на языковых моделях, эмбеддингах и генерации текста. В отличие от ML-инженера, его фокус — работа с неструктурированным текстом и LLM-пайплайнами."
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
                    "Обеспечение надёжности систем"
                ],
                "typical_stack": ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "Prometheus", "Linux"],
                "red_flags": [
                    "Не нравится работа с терминалом",
                    "Хочется писать бизнес-логику"
                ],
                "entry_from": ["backend_developer", "qa_engineer"],
                "can_grow_to": ["security_engineer", "systems_architect"],
                "key_signals": ["systematic_approach", "process_orientation", "automation_mindset", "analytical_thinking"],
                "distinguishing_features": "Связующее звено между разработкой и эксплуатацией платформ. Фокусируется на автоматизации среды и стабильности релизов."
            },
            {
                "id": "data_analyst",
                "name": "Аналитик данных",
                "description": "Анализирует бизнес-данные, строит отчеты и дашборды. Помогает бизнесу принимать решения на основе цифр.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "SQL-запросы и анализ данных",
                    "Создание дашбордов и отчётов",
                    "A/B тестирование",
                    "Презентация инсайтов бизнесу"
                ],
                "typical_stack": ["SQL", "Python", "Excel", "Tableau/Metabase", "Google Analytics"],
                "red_flags": [
                    "Не нравится работать с числами",
                    "Раздражает рутинный анализ"
                ],
                "entry_from": [],
                "can_grow_to": ["data_engineer", "ml_engineer", "product_manager"],
                "key_signals": ["analytical_thinking", "data_driven_mindset", "communication_skills", "detail_orientation"],
                "distinguishing_features": "Находит инсайты в данных для бизнеса. В отличие от Data Engineer, аналитик интерпретирует готовые данные, а не строит архитектуру для их сбора."
            },
            {
                "id": "data_engineer",
                "name": "Data-инженер",
                "description": "Строит пайплайны данных, хранилища и ETL-системы. Отвечает за инфраструктуру, качество и скорость обработки больших данных.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Разработка ETL/ELT пайплайнов",
                    "Проектирование data warehouse",
                    "Обеспечение качества данных",
                    "Оптимизация запросов"
                ],
                "typical_stack": ["Python", "SQL", "Airflow", "Spark", "dbt", "BigQuery/Snowflake"],
                "red_flags": [
                    "Не нравится работать с большими объёмами данных",
                    "Хочется видеть конечный продукт"
                ],
                "entry_from": ["data_analyst", "backend_developer"],
                "can_grow_to": ["ml_engineer", "systems_architect"],
                "key_signals": ["analytical_thinking", "systematic_approach", "data_driven_mindset", "technical_depth_preference"],
                "distinguishing_features": "Специализируется на движении и хранении данных. В отличие от Backend-разработчика, его фокус — не бизнес-логика приложения, а архитектура данных в масштабе."
            },
            {
                "id": "qa_engineer",
                "name": "QA-инженер",
                "description": "Обеспечивает качество продукта через тестирование и автоматизацию. Ищет баги, предотвращает дефекты и улучшает процессы разработки.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Написание тест-кейсов",
                    "Автоматизация тестирования",
                    "Регрессионное тестирование",
                    "Баг-репорты и tracking"
                ],
                "typical_stack": ["Python/Java", "Selenium", "Pytest", "Postman", "Jira"],
                "red_flags": [
                    "Хочется создавать, а не проверять",
                    "Раздражает поиск мелких багов"
                ],
                "entry_from": [],
                "can_grow_to": ["backend_developer", "devops_engineer"],
                "key_signals": ["detail_orientation", "systematic_approach", "critical_thinking", "process_orientation"],
                "distinguishing_features": "Обеспечивает надежность продукта. Акцент на системной проверке сценариев и предотвращении ошибок еще на этапе проектирования."
            },
            {
                "id": "security_engineer",
                "name": "Инженер по безопасности",
                "description": "Защищает системы от киберугроз и уязвимостей. Проводит аудит, пентесты и выстраивает архитектуру безопасности.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Аудит безопасности",
                    "Пен-тестирование",
                    "Настройка защиты инфраструктуры",
                    "Реагирование на инциденты"
                ],
                "typical_stack": ["Linux", "Burp Suite", "Metasploit", "Python", "SIEM tools"],
                "red_flags": [
                    "Не интересует кибербезопасность",
                    "Не нравится искать уязвимости"
                ],
                "entry_from": ["devops_engineer", "backend_developer"],
                "can_grow_to": ["systems_architect"],
                "key_signals": ["analytical_thinking", "critical_thinking", "risk_assessment", "detail_orientation"],
                "distinguishing_features": "Специалист по защите активов и оценке рисков. Внедряет практики безопасной разработки (DevSecOps)."
            },
            {
                "id": "mobile_developer",
                "name": "Мобильный разработчик",
                "description": "Создает приложения для iOS и Android. Работает над мобильным UI/UX, специфичными функциями платформ и оптимизацией производительности.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Разработка мобильных приложений",
                    "Работа с платформенными API",
                    "Оптимизация под разные устройства",
                    "Публикация в App Store/Play Market"
                ],
                "typical_stack": ["Swift/Kotlin", "Flutter", "React Native", "Xcode/Android Studio"],
                "red_flags": [
                    "Не хочется привязываться к платформе",
                    "Раздражают ограничения мобильных ОС"
                ],
                "entry_from": ["frontend_developer"],
                "can_grow_to": ["fullstack_developer", "systems_architect"],
                "key_signals": ["user_empathy", "creative_problem_solving", "detail_orientation", "platform_thinking"],
                "distinguishing_features": "Глубоко знает специфику мобильных устройств, тач-интерфейсов и паттернов мобильного дизайна."
            },
            {
                "id": "game_developer",
                "name": "Разработчик игр",
                "description": "Создает интерактивные игры и развлекательное ПО. Работает над игровой механикой, графикой, физикой и игровым опытом.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Разработка игровой механики",
                    "Работа с игровыми движками",
                    "Оптимизация производительности",
                    "Интеграция графики и звука"
                ],
                "typical_stack": ["C++", "C#", "Unity", "Unreal Engine", "OpenGL/DirectX"],
                "red_flags": [
                    "Не интересуют игры",
                    "Не нравится работать с графикой и физикой"
                ],
                "entry_from": ["frontend_developer", "backend_developer"],
                "can_grow_to": ["systems_architect"],
                "key_signals": ["creative_problem_solving", "visual_thinking", "user_empathy", "performance_optimization"],
                "distinguishing_features": "Фокусируется на интерактивности и графике в реальном времени. Ключевая метрика — вовлеченность игрока."
            },
            {
                "id": "systems_architect",
                "name": "Системный архитектор",
                "description": "Проектирует высокоуровневую структуру систем и техническую стратегию. Выбирает технологии и выстраивает масштабируемую архитектуру.",
                "entry_difficulty": "senior_only",
                "responsibilities": [
                    "Проектирование архитектуры систем",
                    "Выбор технологий и инструментов",
                    "Менторинг команды",
                    "Техническая стратегия"
                ],
                "typical_stack": ["Различные языки", "Cloud (AWS/GCP/Azure)", "Kubernetes", "Microservices"],
                "red_flags": [
                    "Хочется писать код, а не проектировать",
                    "Не нравится принимать стратегические решения"
                ],
                "entry_from": ["backend_developer", "devops_engineer", "fullstack_developer"],
                "can_grow_to": [],
                "key_signals": ["big_picture_thinking", "analytical_thinking", "systematic_approach", "strategic_thinking"],
                "distinguishing_features": "Принимает стратегические технические решения. Его фокус — долгосрочная надежность и масштабируемость системы."
            },
            {
                "id": "product_manager",
                "name": "Продакт-менеджер",
                "description": "Определяет видение продукта, стратегию и дорожную карту. Фокусируется на потребностях пользователей, целях бизнеса и приоритетах фич.",
                "entry_difficulty": "mid",
                "responsibilities": [
                    "Определение продуктовой стратегии",
                    "Приоритизация фич",
                    "Работа с метриками",
                    "Коммуникация со стейкхолдерами"
                ],
                "typical_stack": ["Jira", "Miro", "Amplitude", "Figma", "SQL (базовый)"],
                "red_flags": [
                    "Хочется глубоко кодить",
                    "Не нравится общаться с людьми"
                ],
                "entry_from": ["data_analyst", "fullstack_developer", "ui_ux_researcher"],
                "can_grow_to": [],
                "key_signals": ["big_picture_thinking", "user_empathy", "strategic_thinking", "communication_skills"],
                "distinguishing_features": "Связующее звено между пользователем, бизнесом и разработкой. Управляет ценностью продукта, а не написанием кода."
            },
            {
                "id": "technical_writer",
                "name": "Технический писатель",
                "description": "Создает документацию, руководства и технический контент. Делает сложные технические вещи понятными для пользователей и разработчиков.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Написание технической документации",
                    "Создание туториалов и гайдов",
                    "Поддержка API-документации",
                    "Редактирование контента"
                ],
                "typical_stack": ["Markdown", "Confluence", "Git", "Swagger/OpenAPI"],
                "red_flags": [
                    "Не нравится писать тексты",
                    "Хочется глубоко кодить"
                ],
                "entry_from": [],
                "can_grow_to": ["product_manager"],
                "key_signals": ["communication_skills", "detail_orientation", "user_empathy", "systematic_approach"],
                "distinguishing_features": "Специалист по передаче знаний. Умеет структурировать сложную информацию и делать ее доступной для аудитории разного уровня."
            },
            {
                "id": "ui_ux_researcher",
                "name": "UI/UX-исследователь",
                "description": "Изучает поведение пользователей и проектирует опыт взаимодействия. Проводит исследования, тесты и создает интерфейсы на основе данных.",
                "entry_difficulty": "junior",
                "responsibilities": [
                    "Проведение пользовательских исследований",
                    "Юзабилити-тестирование",
                    "Создание user flows и wireframes",
                    "Дизайн интерфейсов"
                ],
                "typical_stack": ["Figma", "Miro", "Hotjar", "Google Analytics", "UserZoom"],
                "red_flags": [
                    "Не интересует поведение пользователей",
                    "Хочется глубоко программировать"
                ],
                "entry_from": [],
                "can_grow_to": ["product_manager", "frontend_developer"],
                "key_signals": ["user_empathy", "analytical_thinking", "creative_problem_solving", "research_mindset"],
                "distinguishing_features": "Глубоко погружается в психологию пользователя. Использует данные и тесты для подтверждения гипотез дизайна."
            }
        ]
        
        # Create RoleProfile instances and store them
        for role_data in roles_data:
            role = RoleProfile(**role_data)
            self._roles[role.id] = role

    
    def get_role(self, role_id: str) -> Optional[RoleProfile]:
        """
        Retrieve a role profile by its ID.
        
        Args:
            role_id: The unique identifier of the role
            
        Returns:
            RoleProfile if found, None otherwise
        """
        return self._roles.get(role_id)
    
    def get_all_roles(self) -> List[RoleProfile]:
        """
        Retrieve all role profiles.
        
        Returns:
            List of RoleProfile instances
        """
        return list(self._roles.values())
    
    def validate_role_uniqueness(self) -> bool:
        """
        Validate that all role IDs and names are unique.
        
        Returns:
            True if all roles have unique IDs and names, False otherwise
        """
        # Check that we have exactly 16 roles
        if len(self._roles) != 16:
            return False
        
        # Check ID uniqueness (already guaranteed by dict keys, but verify)
        role_ids = [role.id for role in self._roles.values()]
        if len(role_ids) != len(set(role_ids)):
            return False
        
        # Check name uniqueness
        role_names = [role.name for role in self._roles.values()]
        if len(role_names) != len(set(role_names)):
            return False
        
        return True
    
    def validate_similar_roles_distinct(self) -> bool:
        """
        Validate that similar role pairs have distinct key signals.
        
        Checks:
        - ML Engineer vs LLM Engineer
        - Backend Developer vs Data Engineer
        
        Returns:
            True if similar roles have distinct signals, False otherwise
        """
        # Check ML Engineer vs LLM Engineer
        ml_engineer = self.get_role("ml_engineer")
        llm_engineer = self.get_role("llm_engineer")
        
        if ml_engineer and llm_engineer:
            ml_signals = set(ml_engineer.key_signals)
            llm_signals = set(llm_engineer.key_signals)
            
            # They should not have identical signal sets
            if ml_signals == llm_signals:
                return False
        
        # Check Backend Developer vs Data Engineer
        backend_dev = self.get_role("backend_developer")
        data_engineer = self.get_role("data_engineer")
        
        if backend_dev and data_engineer:
            backend_signals = set(backend_dev.key_signals)
            data_signals = set(data_engineer.key_signals)
            
            # They should not have identical signal sets
            if backend_signals == data_signals:
                return False
        
        return True
    
    def get_role_count(self) -> int:
        """
        Get the total number of roles.
        
        Returns:
            Number of roles stored
        """
        return len(self._roles)
