import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Activity,
  Scale,
  Check,
  X,
  CheckCircle2,
  RefreshCcw,
  ArrowRight,
  TrendingUp,
  Server
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ReleaseStageContent() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 1,
      icon: Server,
      name: 'DevOps Engineer',
      tag: 'Инфраструктура',
      quote: 'Рутину — роботам.',
      description: 'Настраивает автоматическую доставку обновлений. Делает так, чтобы код попадал на серверы сам, быстро и без ошибок.',
      color: 'from-orange-500 to-red-500',
      isMain: true
    },
    {
      id: 2,
      icon: Activity,
      name: 'Site Reliability Engineer (SRE)',
      tag: 'Надежность',
      quote: 'Всё когда-нибудь сломается. Я готов к этому.',
      description: 'Отвечает за то, чтобы сайт открывался мгновенно. Если сервер упал в 3 ночи или оплата не проходит — это его проблема.',
      color: 'from-green-500 to-emerald-500',
      isMain: true
    }
  ];

  const skills = [
    'Linux / Bash: Умение работать в командной строке сервера (там нет мышки).',
    'Containerization: Docker & Kubernetes — упаковка приложений в контейнеры.',
    'Cloud Providers: Знание сервисов AWS, Azure или Google Cloud.'
  ];

  const results = [
    'Uptime 99.9%: Сайт доступен пользователям почти всегда.',
    'Fast Rollback: Возможность откатить неудачное обновление за секунды.',
    'Scalability: Система выдерживает наплыв пользователей в «Черную пятницу».'
  ];

  const problemItems = [
    'Downtime: Сайт отключают на час, чтобы обновить версию («Технические работы»).',
    'Human Error: Админ забыл скопировать конфиг, и продакшн упал.',
    'Slow Recovery: Если сервер сломался ночью, бизнес теряет деньги до утра.'
  ];

  const solutionItems = [
    'Zero Downtime: Обновление происходит незаметно для пользователя (Blue-Green Deployment).',
    'Infrastructure as Code: Серверы настраиваются скриптами, а не руками.',
    'Self-Healing: Система сама перезапускает упавшие сервисы.'
  ];

  const activities = [
    {
      icon: Rocket,
      title: 'Деплой',
      description: 'Автоматическая доставка кода на серверы через конвейер CI/CD.'
    },
    {
      icon: Activity,
      title: 'Мониторинг',
      description: 'Наблюдение за здоровьем системы (CPU, память, ошибки) в реальном времени (Grafana).'
    },
    {
      icon: Scale,
      title: 'Масштабирование',
      description: 'Добавление мощностей, когда пользователей становится слишком много.'
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
          Релиз — это только начало<br />жизни продукта
        </h1>

        <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Код написан, протестирован и готов к бою. Теперь нужно доставить его пользователям и следить, чтобы серверы выдержали нагрузку.
        </p>

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium">
            🚀 Этап 5 - Эксплуатация
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
              Ручное управление (Legacy)
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
              Автоматизация (CI/CD)
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
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center space-y-4 hover:border-orange-500/30 transition-colors"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-orange-500/10 rounded-lg">
                  <activity.icon className="text-orange-400" size={32} />
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

      {/* 4. Roles Section */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold text-white text-center">
          Операторы системы
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5 hover:shadow-xl transition-all group h-full flex flex-col gap-2.5 border-2 border-orange-500/50 hover:border-orange-500"
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
              <blockquote className="text-sm italic text-gray-400 border-l-2 border-orange-500/30 pl-3 leading-snug">
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
                <CheckCircle2 className="text-orange-400 shrink-0 mt-0.5" size={24} />
                <span className="text-justify">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Метрики успеха:
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
          <TrendingUp className="w-32 h-32 text-orange-500 opacity-10 -rotate-12" />
        </div>

        <h3 className="text-xl font-bold text-white flex items-center gap-2 relative z-10">
          <span className="text-2xl">💡</span>
          Пример: «Черная пятница»
        </h3>
        <p className="text-lg text-slate-300 leading-relaxed relative z-10">
          В день распродажи на сайт зашло в <span className="text-orange-400 font-semibold">100 раз больше людей</span>.
          Обычный сервер сгорел бы от нагрузки.
          <br />
          <span className="font-semibold text-white">Итог:</span> DevOps настроил <span className="text-green-400 font-semibold">Auto-Scaling</span>.
          Система сама увидела нагрузку, создала 50 копий сервера на время распродажи, а потом удалила их, чтобы не платить за простой.
        </p>
      </motion.div>

      {/* 7. Navigation - Final Call to Action */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center space-y-8 pt-8 pb-12"
      >
        {/* Headline */}
        <h1 className="text-4xl sm:text-4xl font-bold text-white">
          🎉 Вы прошли весь путь!
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Цикл разработки замкнулся.<br />Данные с релиза запускают новый цикл - Исследование.
        </p>

        {/* Visual Accent - Cycle Icon */}
        <div className="flex justify-center py-4">
          <div className="p-4 rounded-full bg-orange-500/10">
            <RefreshCcw className="text-orange-400" size={40} />
          </div>
        </div>

        {/* Buttons - Vertical Stack */}
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          {/* Primary Action */}
          <button
            onClick={() => navigate('/guide')}
            className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
          >
            <span className="text-lg">Вернуться к Карте Профессий</span>
          </button>

          {/* Secondary Action - Ghost Button */}
          <button
            onClick={() => navigate('/guide/discovery')}
            className="group inline-flex items-center gap-2 text-orange-300/70 hover:text-orange-300 font-medium transition-colors"
          >
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            <span>Начать новый цикл - Исследование</span>
          </button>
        </div>
      </motion.div>

    </div>
  );
}

