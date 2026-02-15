import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer } from '../../utils/animations';
import {
  Code,
  GitMerge,
  Bug,
  Check,
  X,
  CheckCircle2,
  ArrowRight,
  Laptop,
  Monitor,
  Server,
  Smartphone,
  Layers,
  Brain,
  Sparkles,
  Database as DatabaseIcon,
  CalendarClock
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function BuildStageContent() {
  const navigate = useNavigate();

  // Group A: Product Engineering Roles
  const productRoles = [
    {
      id: 1,
      icon: Monitor,
      name: 'Frontend Developer',
      tag: 'Визуал',
      quote: 'Делаю так, чтобы кнопки не только красивые, но и работали.',
      description: 'Превращает макеты Figma в живой интерактивный сайт (React, Vue).',
      color: 'from-cyan-500 to-blue-500',
      isMain: false
    },
    {
      id: 2,
      icon: Server,
      name: 'Backend Developer',
      tag: 'Сервер',
      quote: 'Пользователь не видит мою работу, но без неё ничего не работает.',
      description: 'Пишет логику «под капотом», работает с базами данных и API.',
      color: 'from-green-500 to-emerald-500',
      isMain: false
    },
    {
      id: 3,
      icon: Layers,
      name: 'Fullstack Developer',
      tag: 'Универсал',
      quote: 'Знаю и фронт, и бэк. Могу собрать фичу в одиночку.',
      description: 'Боец-одиночка, способный собрать фичу целиком (и фронт, и бэк).',
      color: 'from-purple-500 to-pink-500',
      isMain: true
    },
    {
      id: 4,
      icon: Smartphone,
      name: 'Mobile Developer',
      tag: 'iOS/Android',
      quote: 'Создаю приложения, которые всегда в вашем кармане.',
      description: 'Создает нативные приложения, которые мы скачиваем из сторов.',
      color: 'from-orange-500 to-red-500',
      isMain: false
    }
  ];

  // Group B: Data & AI Engineering Roles
  const dataAiRoles = [
    {
      id: 5,
      icon: Brain,
      name: 'ML Engineer',
      tag: 'Обучение',
      quote: 'Учу машины учиться на данных.',
      description: 'Строит и тренирует модели, которые предсказывают или классифицируют данные.',
      color: 'from-violet-500 to-purple-500',
      isMain: false
    },
    {
      id: 6,
      icon: Sparkles,
      name: 'LLM Engineer',
      tag: 'GPT/GenAI',
      quote: 'Настраиваю GPT-модели под бизнес-задачи.',
      description: 'Настраивает большие языковые модели под конкретные задачи бизнеса.',
      color: 'from-pink-500 to-rose-500',
      isMain: false
    },
    {
      id: 7,
      icon: DatabaseIcon,
      name: 'Data Engineer',
      tag: 'Трубопровод',
      quote: 'Без моих данных ML-модели — просто математика на бумаге.',
      description: 'Собирает, очищает и доставляет данные для ML-инженеров.',
      color: 'from-blue-500 to-cyan-500',
      isMain: false
    }
  ];

  const skills = [
    'Git / GitHub: Умение работать с ветками и разрешать конфликты слияния.',
    'Algorithms: Понимание сложности кода (Big O), чтобы приложение не висло.',
    'Reading Docs: Умение быстро разбираться в чужом API.'
  ];

  const results = [
    'Source Code: Репозиторий с чистым, задокументированным кодом.',
    'Executable/Build: Готовое приложение или Docker-контейнер.',
    'Unit Tests: Автотесты, подтверждающие, что функции работают верно.'
  ];

  const problemItems = [
    'Hardcoding: Пароли и настройки «прибиты гвоздями» прямо в код (небезопасно).',
    'Fragility: «Вроде работает», но исправление одной ошибки ломает три других места.',
    'Bus Factor = 1: Код настолько запутан, что разобраться в нем может только его автор.'
  ];

  const solutionItems = [
    'Code Review: Любой код проверяют коллеги перед слиянием (Merge Request).',
    'DRY & SOLID: Принципы разработки, помогающие избегать дублирования и хаоса.',
    'Version Control: История изменений (Git), позволяющая откатиться назад при ошибке.'
  ];

  const activities = [
    {
      icon: Code,
      title: 'Реализация',
      description: 'Превращают статические макеты дизайнера и требования аналитика в живой, работающий продукт.'
    },
    {
      icon: GitMerge,
      title: 'Контроль качества',
      description: 'Коллеги проверяют код друг друга перед внедрением, чтобы отловить ошибки и сохранить чистоту архитектуры.'
    },
    {
      icon: Bug,
      title: 'Отладка',
      description: 'Расследуют технические сбои. Ищут причину, почему система ведет себя не так, как задумано, и исправляют её.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">

      {/* 1. Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Разработка — воплощение<br />идеи в коде
        </h1>

        <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Магия превращается в логику. Здесь пишут серверы, верстают интерфейсы и обучают нейросети.
        </p>

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium">
            💻 Этап 3 - Сердце проекта
          </span>
        </div>
      </motion.div>

      {/* 2. Contrast Block */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Problem Card */}
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <X className="text-red-400" size={24} />
            <h3 className="text-xl font-semibold text-red-200">
              Спагетти-код (Chaos)
            </h3>
          </div>
          <ul className="space-y-3">
            {problemItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-red-200/80">
                <span className="text-red-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Solution Card */}
        <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Check className="text-green-400" size={24} />
            <h3 className="text-xl font-semibold text-green-200">
              Чистая архитектура (Clean Code)
            </h3>
          </div>
          <ul className="space-y-3">
            {solutionItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-green-200/80">
                <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* 3. Activities Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Что здесь делают?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center space-y-4 hover:border-green-500/30 transition-colors"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <activity.icon className="text-green-400" size={32} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {activity.title}
                </h3>
              </div>
              <p className="text-sm text-slate-400">
                {activity.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 4. Roles Section - Group A: Product Engineering */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Инженеры разработки
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {productRoles.map((role) => (
            <motion.div
              key={role.id}
              variants={fadeInUp}
              className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 hover:shadow-xl transition-all group h-full flex flex-col gap-2.5 ${
                role.isMain
                  ? 'border-2 border-purple-500/50 hover:border-purple-500'
                  : 'border border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Header: Icon + Name */}
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${role.color} rounded-full opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
                  <role.icon className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {role.name}
                  </h3>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r ${role.color} text-white`}>
                    {role.tag}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-sm italic text-gray-400 border-l-2 border-green-500/30 pl-3 leading-snug">
                "{role.quote}"
              </blockquote>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-snug flex-1">
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 4B. Roles Section - Group B: Data & AI Engineering */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8 mt-12"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Создатели интеллектуальных систем
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {dataAiRoles.map((role) => (
            <motion.div
              key={role.id}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 hover:shadow-xl transition-all group h-full flex flex-col gap-2.5 border border-gray-700 hover:border-gray-600"
            >
              {/* Header: Icon + Name */}
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${role.color} rounded-full opacity-90 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
                  <role.icon className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {role.name}
                  </h3>
                  <span className={`inline-block mt-0.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r ${role.color} text-white`}>
                    {role.tag}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-sm italic text-gray-400 border-l-2 border-green-500/30 pl-3 leading-snug">
                "{role.quote}"
              </blockquote>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-snug flex-1">
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 5. Skills & Results */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8"
      >
        {/* Skills */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Что нужно уметь?
          </h3>
          <ul className="space-y-3">
            {skills.map((skill, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={24} />
                <span className="text-justify">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Результат разработки:
          </h3>
          <ul className="space-y-3">
            {results.map((result, index) => (
              <li key={index} className="flex items-start gap-3 text-slate-300">
                <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={24} />
                <span className="text-justify">{result}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* 6. Example Block */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gray-800/50 rounded-xl p-8 border border-gray-700 space-y-4"
      >
        {/* Decorative background icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <CalendarClock className="w-32 h-32 text-green-500 opacity-10 -rotate-12" />
        </div>

        <h3 className="text-xl font-bold text-white flex items-center gap-2 relative z-10">
          <span className="text-2xl">💡</span>
          Пример: «Ручной труд»
        </h3>
        <p className="text-lg text-slate-300 leading-relaxed relative z-10">
          Новичок вручную написал на сайте: <span className="text-yellow-400 font-semibold">«Скидка действует до 31 декабря»</span>.
          Наступило 1 января, разработчик спал, а надпись осталась висеть и вводить людей в заблуждение.
          <br />
          <span className="font-semibold text-white">Итог:</span> Код переписали. Теперь программа сама проверяет текущую дату и убирает баннер, когда время вышло.
        </p>
      </motion.div>

      {/* 7. Navigation */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="flex justify-center pt-4 pb-8"
      >
        <button
          onClick={() => navigate('/guide/verify')}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 cursor-pointer"
        >
          <span className="text-lg">Перейти к этапу Проверка</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </motion.div>

    </div>
  );
}
