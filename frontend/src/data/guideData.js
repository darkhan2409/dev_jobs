// =============================================================================
// Pipeline Guide — Static Data
// 5 визуальных этапов (группировка 10 бэкенд-стадий)
// Артефакты, RPG-экстра для ролей
// =============================================================================

// ---------------------------------------------------------------------------
// 1. GUIDE_STAGES — 5 основных этапов пайплайна
// ---------------------------------------------------------------------------
export const GUIDE_STAGES = [
  {
    id: 'discovery',
    order: 1,
    name: 'Исследование',
    nameEn: 'Discovery',
    subtitle: 'От проблемы к продуктовой гипотезе',
    icon: 'Lightbulb',
    color: '#a78bfa', // violet-400
    description:
      'Поиск идеи, анализ рынка и портрет пользователя. Понимаем, что и для кого строим.',
    whyBlock:
      'Представь, что ты решил открыть кафе. Если не узнать заранее, любят ли люди в этом районе кофе — ты потратишь деньги и закроешься. В IT точно так же: этот этап спасает от создания продукта, который никому не нужен.',
    learningGuide: {
      whatToLearn: [
        'Как формулировать проблему пользователя и проверять гипотезу ценности.',
        'Как проводить базовые интервью и фиксировать инсайты без искажений.',
        'Как определять границы MVP и отделять критичное от второстепенного.'
      ],
      miniPractice:
        'Сделай мини-интервью с 3 потенциальными пользователями и сформируй 1 гипотезу с четким критерием проверки.',
      readinessCriteria:
        'Ты можешь в одном абзаце объяснить проблему, целевую аудиторию и зачем продукту MVP без расплывчатых формулировок.'
    },
    keyDecisions: [
      'Определить целевую аудиторию',
      'Провести Customer Development',
      'Сформулировать ценностное предложение',
      'Определить границы MVP',
    ],
    backendStageIds: ['research'],
    jobSearchQuery: 'product manager продакт менеджер аналитик',
  },
  {
    id: 'design',
    order: 2,
    name: 'Проектирование',
    nameEn: 'Design',
    subtitle: 'Чертежи и схемы будущего продукта',
    icon: 'PenTool',
    color: '#818cf8', // indigo-400
    description:
      'Чертежи, макеты экранов и архитектура БД. Планируем систему до написания кода.',
    whyBlock:
      'Представь, что мы строим небоскреб. Если начать строить без чертежа, дом рухнет. В IT так же: здесь мы решаем, как продукт будет выглядеть и работать, ДО того как напишем первую строчку кода.',
    learningGuide: {
      whatToLearn: [
        'Основы user flow и информационной архитектуры экранов.',
        'Базовые принципы wireframe и системного подхода к UI-компонентам.',
        'Структуру API-контрактов и связи между сущностями в БД.'
      ],
      miniPractice:
        'Нарисуй user flow для одной ключевой задачи (например, отклик на вакансию) и собери 3 wireframe-экрана.',
      readinessCriteria:
        'Ты можешь передать макет и API-контракт так, чтобы разработчик понял задачу без дополнительных созвонов.'
    },
    keyDecisions: [
      'Как выглядят экраны? (UX/UI)',
      'Какие данные храним? (БД)',
      'Как сервисы общаются? (API)',
      'Кто за что отвечает в команде?',
    ],
    backendStageIds: ['design'],
    jobSearchQuery: 'designer дизайнер UX UI проектировщик',
  },
  {
    id: 'build',
    order: 3,
    name: 'Разработка',
    nameEn: 'Build',
    subtitle: 'Магия кода — идея становится продуктом',
    icon: 'Code2',
    color: '#34d399', // emerald-400
    description:
      'Написание кода, API и создание базы данных. Превращаем макеты в реальный продукт.',
    whyBlock:
      'Это как сборка автомобиля на заводе. Каждый инженер собирает свой узел (двигатель, кузов, электрику), а потом всё соединяется в работающую машину. Без чертежей из предыдущего этапа — собрать невозможно.',
    learningGuide: {
      whatToLearn: [
        'Принципы чистого кода, разбиение задач и работа с Git-ветками.',
        'Как строить API-эндпоинты и корректно работать с данными.',
        'Базовую интеграцию фронтенда и бэкенда через единый контракт.'
      ],
      miniPractice:
        'Реализуй одну end-to-end фичу: форма на фронте + API + сохранение в БД + проверка happy-path сценария.',
      readinessCriteria:
        'Фича работает локально целиком, проходит code review и воспроизводится другим участником команды.'
    },
    keyDecisions: [
      'Какие технологии использовать?',
      'Как организовать код? (архитектура)',
      'Как интегрировать компоненты?',
      'Как управлять версиями? (Git)',
    ],
    backendStageIds: ['development'],
    jobSearchQuery: 'developer разработчик программист',
  },
  {
    id: 'verify',
    order: 4,
    name: 'Тестирование',
    nameEn: 'Verify',
    subtitle: 'Охота на баги и уязвимости',
    icon: 'ShieldCheck',
    color: '#fbbf24', // amber-400
    description:
      'Поиск багов, проверка качества и безопасности. Убеждаемся, что всё работает.',
    whyBlock:
      'Представь, что ты покупаешь новый телефон, а он зависает каждые 5 минут. Ты вернёшь его и больше не купишь. Тестирование — это страховка от потери пользователей и репутации.',
    learningGuide: {
      whatToLearn: [
        'Как писать тест-кейсы для критичных пользовательских сценариев.',
        'Как оформлять баг-репорты так, чтобы их быстро воспроизводили.',
        'Базовые принципы проверок безопасности и приоритетов дефектов.'
      ],
      miniPractice:
        'Подготовь 5 тест-кейсов на ключевой сценарий, найди минимум 2 дефекта и оформи их как полноценные баг-репорты.',
      readinessCriteria:
        'Ты можешь обосновать приоритет багов и показать, какие риски они несут для пользователя и бизнеса.'
    },
    keyDecisions: [
      'Что тестировать вручную, а что автоматизировать?',
      'Какие сценарии критичны?',
      'Безопасны ли данные пользователей?',
      'Готов ли продукт к нагрузке?',
    ],
    backendStageIds: ['testing'],
    jobSearchQuery: 'QA тестировщик quality assurance',
  },
  {
    id: 'release',
    order: 5,
    name: 'Запуск и Эксплуатация',
    nameEn: 'Release & Run',
    subtitle: 'Доставка пользователю и поддержка',
    icon: 'Rocket',
    color: '#f472b6', // pink-400
    description:
      'Деплой на сервер, мониторинг и поддержка. Продукт живет и обновляется.',
    whyBlock:
      'Запуск — это не финиш, а старт марафона. После выхода продукта нужно следить за его «здоровьем»: как сервер? не падает ли? пользователи довольны? Это как обслуживание автомобиля после покупки.',
    learningGuide: {
      whatToLearn: [
        'Базовый CI/CD-процесс: сборка, тесты и деплой по шагам.',
        'Что мониторить после релиза: метрики, логи и ключевые алерты.',
        'Как собирать обратную связь и превращать ее в улучшения продукта.'
      ],
      miniPractice:
        'Настрой простой pipeline с авто-сборкой и добавь базовый мониторинг: uptime, ошибки API и время ответа.',
      readinessCriteria:
        'После релиза ты видишь состояние сервиса на дашборде и можешь быстро объяснить, что делать при инциденте.'
    },
    keyDecisions: [
      'Как автоматизировать деплой? (CI/CD)',
      'Что мониторить? (метрики, логи)',
      'Как собирать обратную связь?',
      'Как документировать API?',
    ],
    backendStageIds: ['launch_ops'],
    jobSearchQuery: 'devops SRE инженер инфраструктуры',
  },
];

// ---------------------------------------------------------------------------
// 2. GUIDE_ARTIFACTS — артефакты каждого этапа
// ---------------------------------------------------------------------------
export const GUIDE_ARTIFACTS = [
  // ── Discovery ──
  {
    id: 'vision_document',
    stageId: 'discovery',
    name: 'Vision Document',
    nameRu: 'Документ видения',
    icon: 'FileText',
    definition:
      'Документ, описывающий суть продукта: для кого он, какую проблему решает и чем отличается от конкурентов. Фиксирует общее видение команды.',
    whyItMatters:
      'Без него каждый в команде представляет продукт по-своему. Дизайнер рисует одно, разработчик кодит другое. Итог — хаос и потерянное время.',
    relatedSkills: ['Product Thinking', 'Market Research', 'Stakeholder Management'],
    relatedTools: ['Notion', 'Miro', 'Google Docs'],
  },
  {
    id: 'user_persona',
    stageId: 'discovery',
    name: 'User Persona',
    nameRu: 'Портрет пользователя',
    icon: 'UserCircle',
    definition:
      'Описание типичного пользователя: его боли, цели, привычки и контекст использования продукта. Не абстрактный «все», а конкретный персонаж.',
    whyItMatters:
      'Если не знаешь, для кого строишь — построишь для никого. Персона помогает принимать дизайн-решения: «А Маша бы поняла эту кнопку?»',
    relatedSkills: ['UX Research', 'Empathy Mapping', 'Interview Skills'],
    relatedTools: ['Miro', 'FigJam', 'Notion'],
  },
  {
    id: 'mvp_scope',
    stageId: 'discovery',
    name: 'MVP Scope',
    nameRu: 'Границы MVP',
    icon: 'ListChecks',
    definition:
      'Чёткий список того, что входит в первую версию продукта (In Scope), а что — нет (Out of Scope). Минимум для проверки гипотезы.',
    whyItMatters:
      'Без границ MVP команда будет добавлять фичи бесконечно и никогда не выпустит продукт. MVP — это «достаточно, чтобы проверить идею».',
    relatedSkills: ['Prioritization', 'Product Strategy'],
    relatedTools: ['Jira', 'Linear', 'Notion'],
  },

  // ── Design ──
  {
    id: 'user_flow',
    stageId: 'design',
    name: 'User Flow',
    nameRu: 'Сценарий пользователя',
    icon: 'GitBranch',
    definition:
      'Схема, показывающая шаг за шагом, как пользователь идёт к цели. Например: Главная → Логин → Каталог → Корзина → Оплата.',
    whyItMatters:
      'Если не нарисовать это заранее, разработчик забудет сделать кнопку «Забыли пароль» и пользователи не смогут восстановить доступ.',
    relatedSkills: ['UX Design', 'Logic', 'Information Architecture'],
    relatedTools: ['Miro', 'FigJam', 'Whimsical'],
  },
  {
    id: 'wireframe',
    stageId: 'design',
    name: 'Wireframe',
    nameRu: 'Каркас экрана',
    icon: 'Layout',
    definition:
      'Черно-белый «скелет» экрана без цветов и красоты. Показывает расположение элементов: где заголовок, где кнопка, где список.',
    whyItMatters:
      'Дешевле переделать каркас из прямоугольников, чем готовый цветной макет. Wireframe — это черновик, который можно быстро исправить.',
    relatedSkills: ['UI Design', 'Layout', 'Prototyping'],
    relatedTools: ['Figma', 'Sketch', 'Balsamiq'],
  },
  {
    id: 'db_schema',
    stageId: 'design',
    name: 'DB Schema',
    nameRu: 'Схема базы данных',
    icon: 'Database',
    definition:
      'Описание таблиц, полей и связей в базе данных. Определяет, как хранить информацию: пользователей, заказы, товары.',
    whyItMatters:
      'Плохая схема БД — как фундамент с трещиной. Всё, что построено сверху, рано или поздно рухнет. Переделывать БД на живом продукте — очень дорого.',
    relatedSkills: ['SQL', 'Data Modeling', 'Normalization'],
    relatedTools: ['PostgreSQL', 'dbdiagram.io', 'DataGrip'],
  },
  {
    id: 'api_contract',
    stageId: 'design',
    name: 'API Contract',
    nameRu: 'Контракт API',
    icon: 'FileCode',
    definition:
      'Соглашение о том, как фронтенд и бэкенд общаются: какие запросы посылать, какие данные получать, какие ошибки возможны.',
    whyItMatters:
      'Без контракта фронтенд-разработчик ждёт, пока бэкенд напишет API. С контрактом — оба работают параллельно, а потом просто подключают.',
    relatedSkills: ['REST API', 'OpenAPI/Swagger', 'JSON'],
    relatedTools: ['Swagger', 'Postman', 'Stoplight'],
  },

  // ── Build ──
  {
    id: 'working_code',
    stageId: 'build',
    name: 'Working Code',
    nameRu: 'Рабочий код',
    icon: 'Terminal',
    definition:
      'Написанный, отлаженный и работающий исходный код продукта. Включает фронтенд (то, что видит пользователь) и бэкенд (серверная логика).',
    whyItMatters:
      'Это сердце продукта. Код должен быть не только рабочим, но и читаемым — ведь его будут поддерживать другие разработчики.',
    relatedSkills: ['Programming', 'Clean Code', 'Design Patterns'],
    relatedTools: ['VS Code', 'Git', 'GitHub'],
  },
  {
    id: 'pull_request',
    stageId: 'build',
    name: 'Pull Request',
    nameRu: 'Запрос на слияние',
    icon: 'GitPullRequest',
    definition:
      'Предложение изменений в основной код. Другие разработчики проверяют код (Code Review), оставляют комментарии и одобряют или просят доработать.',
    whyItMatters:
      'Code Review ловит баги до продакшена, распространяет знания по команде и поддерживает единый стиль кода.',
    relatedSkills: ['Git', 'Code Review', 'Communication'],
    relatedTools: ['GitHub', 'GitLab', 'Bitbucket'],
  },

  // ── Verify ──
  {
    id: 'test_plan',
    stageId: 'verify',
    name: 'Test Plan',
    nameRu: 'План тестирования',
    icon: 'ClipboardCheck',
    definition:
      'Документ, описывающий что, как и когда тестировать. Включает тест-кейсы: конкретные шаги и ожидаемые результаты.',
    whyItMatters:
      'Без плана тестирование превращается в «покликал — вроде работает». План гарантирует, что все критичные сценарии проверены.',
    relatedSkills: ['Test Design', 'Analytical Thinking'],
    relatedTools: ['TestRail', 'Qase', 'Google Sheets'],
  },
  {
    id: 'bug_report',
    stageId: 'verify',
    name: 'Bug Report',
    nameRu: 'Баг-репорт',
    icon: 'Bug',
    definition:
      'Структурированный отчёт об ошибке: что произошло, как воспроизвести, что ожидалось и что получилось. С приложенными скриншотами.',
    whyItMatters:
      'Плохой баг-репорт: «Не работает». Хороший: «При клике на кнопку Купить в Safari на iPhone — белый экран. Ожидание: переход в корзину.» Второй починят за час, первый — за неделю.',
    relatedSkills: ['Attention to Detail', 'Communication', 'Reproduction'],
    relatedTools: ['Jira', 'Linear', 'Bugzilla'],
  },
  {
    id: 'security_audit',
    stageId: 'verify',
    name: 'Security Audit',
    nameRu: 'Аудит безопасности',
    icon: 'Shield',
    definition:
      'Проверка системы на уязвимости: SQL-инъекции, XSS, утечки данных. Результат — отчёт с уровнями критичности и рекомендациями.',
    whyItMatters:
      'Одна дыра в безопасности может стоить компании репутации, денег и данных пользователей. Лучше найти уязвимость самим, чем ждать хакеров.',
    relatedSkills: ['OWASP Top 10', 'Penetration Testing', 'Risk Assessment'],
    relatedTools: ['OWASP ZAP', 'Burp Suite', 'SonarQube'],
  },

  // ── Release ──
  {
    id: 'cicd_pipeline',
    stageId: 'release',
    name: 'CI/CD Pipeline',
    nameRu: 'Пайплайн CI/CD',
    icon: 'GitMerge',
    definition:
      'Автоматическая цепочка: код попадает в репозиторий → прогоняются тесты → собирается билд → деплоится на сервер. Без ручного вмешательства.',
    whyItMatters:
      'Ручной деплой — это стресс и ошибки. CI/CD автоматизирует рутину: каждое изменение в коде автоматически проверяется и выкатывается.',
    relatedSkills: ['DevOps', 'Docker', 'YAML'],
    relatedTools: ['GitHub Actions', 'GitLab CI', 'Jenkins'],
  },
  {
    id: 'monitoring_dashboard',
    stageId: 'release',
    name: 'Monitoring Dashboard',
    nameRu: 'Дашборд мониторинга',
    icon: 'Activity',
    definition:
      'Приборная панель с графиками: нагрузка на сервер, время ответа API, количество ошибок, число активных пользователей.',
    whyItMatters:
      'Без мониторинга ты узнаешь о падении сервера от разгневанных пользователей. С мониторингом — от алерта в Slack за 30 секунд до того, как кто-то заметит.',
    relatedSkills: ['Observability', 'Metrics', 'Alerting'],
    relatedTools: ['Grafana', 'Prometheus', 'Datadog'],
  },
  {
    id: 'api_docs',
    stageId: 'release',
    name: 'API Documentation',
    nameRu: 'Документация API',
    icon: 'BookOpen',
    definition:
      'Подробное описание всех эндпоинтов API: URL, методы, параметры, примеры запросов и ответов. Читаемое как для людей, так и для машин.',
    whyItMatters:
      'Без документации каждый новый разработчик тратит часы на «а как вызвать этот эндпоинт?». Документация экономит время всей команды.',
    relatedSkills: ['Technical Writing', 'OpenAPI', 'Markdown'],
    relatedTools: ['Swagger UI', 'Redoc', 'Notion'],
  },
];

// ---------------------------------------------------------------------------
// 3. GUIDE_ROLE_EXTRAS — RPG-стилистика для ролей (overlay на API-данные)
// ---------------------------------------------------------------------------
export const GUIDE_ROLE_EXTRAS = {
  product_manager: {
    classTagline: 'Мини-CEO продукта',
    icon: 'Crown',
    attributes: [
      { name: 'Видение', level: 5 },
      { name: 'Коммуникация', level: 4 },
      { name: 'Аналитика', level: 3 },
    ],
    simplifiedDescription:
      'Решает, ЧТО именно нужно делать и в каком порядке. Переводит потребности пользователей в задачи для команды.',
    tools: ['Jira', 'Miro', 'Figma', 'Notion'],
    searchKeywords: 'product manager',
  },
  product_analyst: {
    classTagline: 'Детектив данных',
    icon: 'BarChart3',
    attributes: [
      { name: 'Аналитика', level: 5 },
      { name: 'Логика', level: 4 },
      { name: 'Внимательность', level: 4 },
    ],
    simplifiedDescription:
      'Анализирует поведение пользователей и метрики продукта. Находит, что работает, а что нет, и предлагает улучшения на основе данных.',
    tools: ['SQL', 'Amplitude', 'Google Analytics', 'Excel'],
    searchKeywords: 'product analyst',
  },
  business_analyst: {
    classTagline: 'Переводчик с бизнес-языка',
    icon: 'Briefcase',
    attributes: [
      { name: 'Коммуникация', level: 5 },
      { name: 'Логика', level: 4 },
      { name: 'Документация', level: 4 },
    ],
    simplifiedDescription:
      'Берёт запросы бизнеса («сделайте хорошо») и превращает в понятные требования для разработчиков.',
    tools: ['Confluence', 'Jira', 'UML', 'SQL'],
    searchKeywords: 'business analyst',
  },
  project_manager: {
    classTagline: 'Дирижёр команды',
    icon: 'Clock',
    attributes: [
      { name: 'Организация', level: 5 },
      { name: 'Коммуникация', level: 5 },
      { name: 'Планирование', level: 4 },
    ],
    simplifiedDescription:
      'Следит за сроками, ресурсами и коммуникацией. Убирает блокеры и помогает команде двигаться к цели.',
    tools: ['Jira', 'Slack', 'Notion', 'Google Calendar'],
    searchKeywords: 'project manager',
  },
  ux_designer: {
    classTagline: 'Архитектор удобства',
    icon: 'Compass',
    attributes: [
      { name: 'Эмпатия', level: 5 },
      { name: 'Логика', level: 4 },
      { name: 'Креативность', level: 4 },
    ],
    simplifiedDescription:
      'Проектирует логику взаимодействия: как пользователь переходит между экранами, где нажимает, что видит.',
    tools: ['Figma', 'Miro', 'Maze', 'UserTesting'],
    searchKeywords: 'UX designer',
  },
  ui_designer: {
    classTagline: 'Мастер пикселей',
    icon: 'Palette',
    attributes: [
      { name: 'Креативность', level: 5 },
      { name: 'Эстетика', level: 5 },
      { name: 'Внимательность', level: 4 },
    ],
    simplifiedDescription:
      'Создаёт визуальный стиль: цвета, типографику, иконки, анимации. Превращает каркасы в красивые экраны.',
    tools: ['Figma', 'Adobe Illustrator', 'Principle'],
    searchKeywords: 'UI designer',
  },
  system_analyst: {
    classTagline: 'Переводчик с человеческого на компьютерный',
    icon: 'Cpu',
    attributes: [
      { name: 'Логика', level: 5 },
      { name: 'Внимательность', level: 5 },
      { name: 'Коммуникация', level: 3 },
    ],
    simplifiedDescription:
      'Проектирует структуру таблиц БД и схемы интеграций. Берёт хотелку бизнеса и превращает в точное техническое задание.',
    tools: ['SQL', 'UML', 'Confluence', 'Draw.io'],
    searchKeywords: 'системный аналитик',
  },
  systems_architect: {
    classTagline: 'Главный инженер системы',
    icon: 'Network',
    attributes: [
      { name: 'Системное мышление', level: 5 },
      { name: 'Технический кругозор', level: 5 },
      { name: 'Стратегия', level: 4 },
    ],
    simplifiedDescription:
      'Проектирует общую техническую архитектуру: как сервисы взаимодействуют, где хранятся данные, как масштабировать.',
    tools: ['Draw.io', 'AWS', 'Kubernetes', 'Terraform'],
    searchKeywords: 'architect',
  },
  backend_developer: {
    classTagline: 'Мастер серверной логики',
    icon: 'Server',
    attributes: [
      { name: 'Логика', level: 5 },
      { name: 'Алгоритмы', level: 4 },
      { name: 'Базы данных', level: 4 },
    ],
    simplifiedDescription:
      'Пишет серверную логику: обработку запросов, работу с базой данных, интеграции с внешними сервисами. То, что работает «под капотом».',
    tools: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    searchKeywords: 'backend developer',
  },
  frontend_developer: {
    classTagline: 'Оживитель дизайна',
    icon: 'Monitor',
    attributes: [
      { name: 'JavaScript', level: 5 },
      { name: 'Эстетика', level: 3 },
      { name: 'UX-мышление', level: 3 },
    ],
    simplifiedDescription:
      'Превращает макеты дизайнера в живые интерактивные экраны. Пишет код, который работает в браузере пользователя.',
    tools: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    searchKeywords: 'frontend developer react',
  },
  mobile_developer: {
    classTagline: 'Создатель мобильного опыта',
    icon: 'Smartphone',
    attributes: [
      { name: 'Мобильные фреймворки', level: 5 },
      { name: 'UX-мышление', level: 4 },
      { name: 'Оптимизация', level: 4 },
    ],
    simplifiedDescription:
      'Разрабатывает приложения для iOS и Android. Адаптирует интерфейс под сенсорное управление и маленькие экраны.',
    tools: ['Swift', 'Kotlin', 'Flutter', 'React Native'],
    searchKeywords: 'mobile developer',
  },
  ml_engineer: {
    classTagline: 'Дрессировщик алгоритмов',
    icon: 'Brain',
    attributes: [
      { name: 'Математика', level: 5 },
      { name: 'Python', level: 5 },
      { name: 'Исследования', level: 4 },
    ],
    simplifiedDescription:
      'Обучает модели машинного обучения: рекомендации, распознавание, прогнозы. Превращает данные в умные алгоритмы.',
    tools: ['Python', 'PyTorch', 'scikit-learn', 'Jupyter'],
    searchKeywords: 'machine learning engineer',
  },
  llm_engineer: {
    classTagline: 'Инженер языковых моделей',
    icon: 'Bot',
    attributes: [
      { name: 'NLP', level: 5 },
      { name: 'Промпт-инженерия', level: 5 },
      { name: 'Архитектура', level: 4 },
    ],
    simplifiedDescription:
      'Интегрирует ИИ-модели (GPT, Claude) в продукты. Строит RAG-системы, чат-ботов и AI-ассистентов.',
    tools: ['OpenAI API', 'LangChain', 'Python', 'Vector DB'],
    searchKeywords: 'LLM engineer AI',
  },
  data_engineer: {
    classTagline: 'Строитель данных-трубопроводов',
    icon: 'Workflow',
    attributes: [
      { name: 'SQL', level: 5 },
      { name: 'ETL', level: 5 },
      { name: 'Архитектура данных', level: 4 },
    ],
    simplifiedDescription:
      'Строит пайплайны данных: собирает, очищает и доставляет данные из разных источников для аналитиков и ML-инженеров.',
    tools: ['Apache Airflow', 'Spark', 'SQL', 'dbt'],
    searchKeywords: 'data engineer',
  },
  manual_qa: {
    classTagline: 'Охотник на баги',
    icon: 'Search',
    attributes: [
      { name: 'Внимательность', level: 5 },
      { name: 'Критическое мышление', level: 5 },
      { name: 'Коммуникация', level: 4 },
    ],
    simplifiedDescription:
      'Проверяет продукт вручную: кликает кнопки, заполняет формы, ищет сценарии, когда что-то ломается.',
    tools: ['Jira', 'Charles Proxy', 'DevTools', 'TestRail'],
    searchKeywords: 'QA тестировщик manual',
  },
  qa_automation: {
    classTagline: 'Автоматизатор проверок',
    icon: 'Zap',
    attributes: [
      { name: 'Программирование', level: 4 },
      { name: 'Тест-дизайн', level: 5 },
      { name: 'CI/CD', level: 3 },
    ],
    simplifiedDescription:
      'Пишет автоматические тесты: скрипты, которые проверяют продукт без участия человека. Экономит сотни часов ручного тестирования.',
    tools: ['Selenium', 'Playwright', 'pytest', 'Cypress'],
    searchKeywords: 'QA automation',
  },
  security_engineer: {
    classTagline: 'Страж цифровой крепости',
    icon: 'Lock',
    attributes: [
      { name: 'Безопасность', level: 5 },
      { name: 'Сетевые протоколы', level: 4 },
      { name: 'Криптография', level: 4 },
    ],
    simplifiedDescription:
      'Ищет уязвимости в системе и защищает данные пользователей. Проводит аудиты и пентесты — «легальный взлом» для защиты.',
    tools: ['OWASP ZAP', 'Burp Suite', 'Nmap', 'Wireshark'],
    searchKeywords: 'security engineer',
  },
  devops_engineer: {
    classTagline: 'Мастер инфраструктуры',
    icon: 'Container',
    attributes: [
      { name: 'Linux', level: 5 },
      { name: 'Автоматизация', level: 5 },
      { name: 'Облака', level: 4 },
    ],
    simplifiedDescription:
      'Настраивает серверы, CI/CD пайплайны и облачную инфраструктуру. Автоматизирует всё, чтобы код попадал к пользователю быстро и надёжно.',
    tools: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS'],
    searchKeywords: 'devops engineer',
  },
  sre: {
    classTagline: 'Хранитель надёжности',
    icon: 'HeartPulse',
    attributes: [
      { name: 'Мониторинг', level: 5 },
      { name: 'Автоматизация', level: 5 },
      { name: 'Troubleshooting', level: 5 },
    ],
    simplifiedDescription:
      'Следит за надёжностью и выносливостью систем под нагрузкой. Когда сервис падает в 3 часа ночи — SRE его поднимает.',
    tools: ['Prometheus', 'Grafana', 'PagerDuty', 'Terraform'],
    searchKeywords: 'SRE site reliability',
  },
  data_analyst: {
    classTagline: 'Рассказчик на языке данных',
    icon: 'PieChart',
    attributes: [
      { name: 'SQL', level: 5 },
      { name: 'Визуализация', level: 4 },
      { name: 'Бизнес-мышление', level: 4 },
    ],
    simplifiedDescription:
      'Работает с данными для поиска инсайтов: пишет SQL-запросы, строит дашборды и помогает бизнесу принимать решения на основе цифр.',
    tools: ['SQL', 'Tableau', 'Python', 'Excel'],
    searchKeywords: 'data analyst',
  },
  technical_writer: {
    classTagline: 'Мастер ясности',
    icon: 'PenLine',
    attributes: [
      { name: 'Письменная речь', level: 5 },
      { name: 'Техническая грамотность', level: 4 },
      { name: 'Эмпатия', level: 4 },
    ],
    simplifiedDescription:
      'Пишет документацию, которую люди действительно читают. Объясняет сложное простым языком для разработчиков и пользователей.',
    tools: ['Markdown', 'Confluence', 'Notion', 'Swagger'],
    searchKeywords: 'technical writer',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Найти guide-этап по id */
export const getGuideStage = (stageId) =>
  GUIDE_STAGES.find((s) => s.id === stageId);

/** Получить артефакты для guide-этапа */
export const getArtifactsForStage = (stageId) =>
  GUIDE_ARTIFACTS.filter((a) => a.stageId === stageId);

/** Найти артефакт по id */
export const getArtifact = (artifactId) =>
  GUIDE_ARTIFACTS.find((a) => a.id === artifactId);

/** Получить RPG-экстра для роли */
export const getRoleExtras = (roleId) =>
  GUIDE_ROLE_EXTRAS[roleId] || null;

/** Получить все backend stage ids для guide-этапа */
export const getBackendStageIds = (guideStageId) => {
  const stage = getGuideStage(guideStageId);
  return stage ? stage.backendStageIds : [];
};

/** Найти guide-этап, к которому относится backend stage */
export const findGuideStageByBackendId = (backendStageId) =>
  GUIDE_STAGES.find((s) => s.backendStageIds.includes(backendStageId));
