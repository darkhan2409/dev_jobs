import { motion } from 'framer-motion';
import { Compass, Clock, Target, Sparkles, Play, HelpCircle } from 'lucide-react';
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
        </motion.div>
    );
};

export default WelcomeScreen;
