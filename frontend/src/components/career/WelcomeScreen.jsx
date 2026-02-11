import { motion } from 'framer-motion';
import { Compass, Clock, Target, Sparkles, Play, HelpCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const WelcomeScreen = ({ onStart, isLoading }) => {
    const features = [
        {
            icon: Target,
            title: 'Персональная рекомендация',
            description: 'Узнайте, какая IT-профессия подходит вам лучше всего'
        },
        {
            icon: Sparkles,
            title: 'Анализ профиля',
            description: 'Получите детальный анализ вашего когнитивного стиля'
        },
        {
            icon: Compass,
            title: 'Альтернативы',
            description: 'Откройте для себя смежные направления развития'
        }
    ];

    const methodologySteps = [
        'Вы отвечаете на 25 вопросов о предпочтениях, стиле мышления и рабочих сценариях.',
        'Система сопоставляет паттерны ответов с профилями IT-направлений и вычисляет ранжирование.',
        'На выходе вы получаете рекомендацию по роли, альтернативы и ориентиры для следующего шага.'
    ];

    return (
        <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {/* Hero Header */}
            <motion.div variants={fadeInUp} className="mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-6">
                    <Compass className="w-10 h-10 text-violet-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Найди свою IT-профессию
                    </span>
                </h1>
                <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
                    Пройдите тест из 25 вопросов и узнайте, какое направление в IT
                    подходит вам лучше всего на основе вашего стиля мышления.
                </p>

                {/* Primary CTA Button */}
                <motion.button
                    onClick={onStart}
                    disabled={isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white text-xl font-bold shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-3">
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Загрузка...
                        </span>
                    ) : (
                        <span className="flex items-center gap-3">
                            <Play className="w-6 h-6 fill-white" />
                            Начать тест
                        </span>
                    )}
                </motion.button>

                {/* Meta Information */}
                <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mt-6">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>10-15 минут</span>
                    </div>
                    <span className="text-slate-700">•</span>
                    <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" />
                        <span>25 вопросов</span>
                    </div>
                </div>
            </motion.div>

            {/* Feature Cards (Secondary) */}
            <motion.div
                variants={fadeInUp}
                className="grid md:grid-cols-3 gap-4"
            >
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/50 hover:border-slate-700/70 transition-colors"
                    >
                        <feature.icon className="w-8 h-8 text-violet-400 mb-4 mx-auto" />
                        <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                ))}
            </motion.div>

            {/* Methodology Block */}
            <motion.section
                variants={fadeInUp}
                className="mt-8 p-6 rounded-2xl bg-slate-900/45 border border-slate-800 text-left"
            >
                <h2 className="text-xl font-semibold text-white mb-4">Как работает тест</h2>

                <ol className="space-y-3">
                    {methodologySteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-3 text-slate-300">
                            <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold">
                                {index + 1}
                            </span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>

                <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-300" />
                    <p className="text-sm leading-relaxed">
                        Результат теста — это рекомендация, а не диагноз. Используйте его как ориентир, затем сверяйте с практикой и личными интересами.
                    </p>
                </div>

                <Link
                    to="/guide"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors"
                >
                    Как интерпретировать результат
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.section>
        </motion.div>
    );
};

export default WelcomeScreen;
