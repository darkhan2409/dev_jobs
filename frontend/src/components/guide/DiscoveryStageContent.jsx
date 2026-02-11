import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MessageCircle,
  Lightbulb,
  User,
  Briefcase,
  Crown,
  BarChart3,
  Check,
  X,
  CheckCircle2,
  ArrowRight,
  Smartphone
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

export default function DiscoveryStageContent() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 1,
      icon: Crown,
      name: 'Product Manager',
      tag: 'Лидер этапа',
      quote: 'Мы не пишем код, пока не поймем, кому это нужно.',
      description: 'Отвечает за успех продукта. Считает деньги, изучает рынок и говорит «нет» ненужным фичам.',
      color: 'from-purple-500 to-pink-500',
      isMain: true
    },
    {
      id: 2,
      icon: Briefcase,
      name: 'Business Analyst',
      tag: 'Структура',
      quote: 'Превращаю хаос идей в четкое ТЗ.',
      description: 'Собирает требования от бизнеса и переводит их на технический язык, понятный разработчикам.',
      color: 'from-blue-500 to-cyan-500',
      isMain: false
    },
    {
      id: 3,
      icon: User,
      name: 'UX Researcher',
      tag: 'Эмпатия',
      quote: 'Я знаю, чего на самом деле хочет пользователь.',
      description: 'Проводит интервью и тесты, чтобы интерфейс был удобным, а не просто красивым.',
      color: 'from-green-500 to-emerald-500',
      isMain: false
    },
    {
      id: 4,
      icon: BarChart3,
      name: 'Data Analyst',
      tag: 'Факты',
      quote: 'Цифры не врут. Интуиция — врет.',
      description: 'Ищет инсайты в данных и метриках, чтобы решения принимались на основе фактов.',
      color: 'from-orange-500 to-red-500',
      isMain: false
    }
  ];

  const skills = [
    'Не просто «слушать», а проводить глубинные интервью по методике, чтобы вытащить истину.',
    'Умение посчитать на салфетке: «Привлечение клиента стоит $10, а заработаем мы $5. Бизнес не сойдется»',
    'Навык быстро формулировать идею и придумывать дешевый способ её проверить (без кода).'
  ];

  const results = [
    'Бизнес-модель на одной странице (вместо толстого бизнес-плана).',
    'Карта пути пользователя (как он находит нас, регистрируется и платит).',
    'Приоритезированный список задач для первой версии (MVP).'
  ];

  const problemItems = [
    'Разработка в вакууме: Строим продукт на догадках, а не фактах.',
    'Высокий риск провала: Вероятность, что продукт не найдет рынок.',
    'Потеря бюджета: Инвестиции в функционал, который не будет востребован.'
  ];

  const solutionItems = [
    'Data-Driven решения: Проверяем гипотезы до написания кода.',
    'Четкий скоуп: Фокусируемся только на критически важных фичах.',
    'Гарантия спроса: Понимаем, кто и почему заплатит за продукт.'
  ];

  const activities = [
    {
      icon: Search,
      title: 'Анализ конкурентов',
      description: 'Изучаем чужие продукты. Ищем их слабые места, чтобы не повторять ошибок.'
    },
    {
      icon: MessageCircle,
      title: 'Интервью',
      description: 'Говорим с людьми лично. Узнаем их реальные боли, а не придумываем их.'
    },
    {
      icon: Lightbulb,
      title: 'Проверка гипотез',
      description: 'Формулируем идею продукта и проверяем цифрами, нужна ли она рынку.'
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
          Исследование — поиск идеи<br />и проверка гипотез
        </h1>

        <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Прежде чем писать код, мы должны понять: что мы строим и нужно ли это людям?
        </p>

        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium">
            💡 Этап 1 - Самый важный этап для бизнеса
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
              Риски отсутствия этапа
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
              Ценность исследования
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

      {/* 3. What do we do? Section */}
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
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center space-y-4 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex justify-center">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <activity.icon className="text-purple-400" size={32} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white">
                {activity.title}
              </h3>
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
          Продуктовые стратеги
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
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
              <blockquote className="text-sm italic text-gray-400 border-l-2 border-purple-500/30 pl-3 leading-snug">
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
                <CheckCircle2 className="text-purple-400 shrink-0 mt-0.5" size={24} />
                <span className="text-justify">{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">
            Результат исследования:
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
          <Smartphone className="w-32 h-32 text-purple-500 opacity-10 -rotate-12" />
        </div>

        <h3 className="text-xl font-bold text-white flex items-center gap-2 relative z-10">
          <span className="text-2xl">💡</span>
          Пример:
        </h3>
        <p className="text-lg text-slate-300 leading-relaxed relative z-10">
          Команда хотела сделать <span className="text-purple-400 font-semibold">«Мобильное приложение, чтобы писать код в метро»</span>.
          На этапе исследования они дали телефон 20 разработчикам. Выяснилось, что печатать код на экранной клавиатуре — это мучение,
          и никто не будет этим пользоваться.
          <br />
          <span className="font-semibold text-white">Итог:</span> Идею закрыли до начала разработки и сэкономили $50,000.
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
          onClick={() => navigate('/guide/design')}
          className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          <span className="text-lg">Перейти к этапу Проектирование</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </motion.div>

    </div>
  );
}
