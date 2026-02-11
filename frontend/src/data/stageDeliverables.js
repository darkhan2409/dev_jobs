// Mock deliverables data for each stage
export const STAGE_DELIVERABLES = {
    discovery: {
        persona: {
            name: "Junior Developer",
            painPoint: "Не могу найти вакансии без опыта",
            goal: "Получить первую работу в IT"
        },
        vision: {
            statement: "DevJobs — это агрегатор, который помогает джунам находить работу без шума."
        },
        mvpScope: {
            inScope: ["Лента вакансий", "Фильтры по компаниям", "Подбор по навыкам"],
            outOfScope: ["Социальная сеть", "Мессенджер", "Видео-интервью"]
        }
    },
    design: {
        persona: {
            name: "UX Designer",
            painPoint: "Сложно донести логику интерфейса до разработчиков",
            goal: "Создать понятные макеты и User Flow"
        },
        vision: {
            statement: "Интуитивный интерфейс, где джун находит вакансию за 3 клика."
        },
        mvpScope: {
            inScope: ["Главная страница", "Каталог вакансий", "Страница вакансии"],
            outOfScope: ["Личный кабинет", "Чат с HR", "Календарь собеседований"]
        }
    },
    build: {
        persona: {
            name: "Backend Developer",
            painPoint: "Нужно быстро поднять API для фронтенда",
            goal: "Написать чистый и масштабируемый код"
        },
        vision: {
            statement: "API, которое возвращает вакансии за 200ms и выдерживает 1000 RPS."
        },
        mvpScope: {
            inScope: ["REST API", "База данных PostgreSQL", "Авторизация JWT"],
            outOfScope: ["GraphQL", "Микросервисы", "Кэширование Redis"]
        }
    },
    verify: {
        persona: {
            name: "QA Engineer",
            painPoint: "Баги находят пользователи, а не я",
            goal: "Покрыть критичные сценарии тестами"
        },
        vision: {
            statement: "Продукт, где каждая кнопка работает, а каждая форма валидируется."
        },
        mvpScope: {
            inScope: ["Ручное тестирование", "Smoke-тесты", "Баг-репорты"],
            outOfScope: ["E2E автотесты", "Нагрузочное тестирование", "A/B тесты"]
        }
    },
    release: {
        persona: {
            name: "DevOps Engineer",
            painPoint: "Деплой вручную — это стресс и ошибки",
            goal: "Автоматизировать выкатку на продакшн"
        },
        vision: {
            statement: "Один git push — и код автоматически тестируется, собирается и деплоится."
        },
        mvpScope: {
            inScope: ["CI/CD pipeline", "Docker", "Мониторинг Grafana"],
            outOfScope: ["Kubernetes", "Multi-region deployment", "Blue-green deployment"]
        }
    }
};


// Main role for each stage
export const STAGE_MAIN_ROLES = {
    discovery: {
        role_id: 'product_manager',
        quote: 'Моя задача — найти проблему, за решение которой люди заплатят.'
    },
    design: {
        role_id: 'ux_designer',
        quote: 'Я проектирую путь пользователя: как он переходит между экранами и достигает цели.'
    },
    build: {
        role_id: 'backend_developer',
        quote: 'Я пишу серверную логику, которая обрабатывает запросы и работает с данными.'
    },
    verify: {
        role_id: 'manual_qa',
        quote: 'Я ищу баги до того, как их найдут пользователи.'
    },
    release: {
        role_id: 'devops_engineer',
        quote: 'Я автоматизирую деплой, чтобы код попадал к пользователям быстро и безопасно.'
    }
};

// Outcome checklist for each stage
export const STAGE_OUTCOMES = {
    discovery: {
        items: [
            'Поняли, какую проблему решаем (чтобы не делать ерунду).',
            'Узнали своего пользователя (кто он и чего хочет).',
            'Решили, какие функции делаем сейчас, а какие — потом.'
        ],
        nextStageId: 'design',
        nextStageName: 'Проектирование'
    },
    design: {
        items: [
            'Нарисовали, как будут выглядеть экраны.',
            'Спроектировали базу данных (где и как хранить информацию).',
            'Договорились, как фронтенд и бэкенд будут общаться (API).'
        ],
        nextStageId: 'build',
        nextStageName: 'Разработка'
    },
    build: {
        items: [
            'Написали рабочий код для фронтенда и бэкенда.',
            'Создали базу данных и API.',
            'Проверили код через Code Review (чтобы не было глупых ошибок).'
        ],
        nextStageId: 'verify',
        nextStageName: 'Тестирование'
    },
    verify: {
        items: [
            'Нашли и исправили баги.',
            'Проверили безопасность (нет ли дыр для хакеров).',
            'Убедились, что критичные сценарии работают.'
        ],
        nextStageId: 'release',
        nextStageName: 'Запуск'
    },
    release: {
        items: [
            'Настроили автоматический деплой (CI/CD).',
            'Запустили мониторинг (чтобы знать, если что-то сломается).',
            'Написали документацию для команды и пользователей.'
        ],
        nextStageId: null,
        nextStageName: null
    }
};
