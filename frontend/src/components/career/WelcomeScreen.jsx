import { motion } from 'framer-motion';
import { Compass, Clock, Target, Sparkles, ArrowRight } from 'lucide-react';
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
            <motion.div variants={fadeInUp} className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 mb-6">
                    <Compass className="w-10 h-10 text-violet-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Найди свою IT-профессию
                </h1>
                <p className="text-lg text-slate-400 max-w-xl mx-auto">
                    Пройдите тест из 25 вопросов и узнайте, какое направление в IT
                    подходит вам лучше всего на основе вашего стиля мышления.
                </p>
            </motion.div>

            <motion.div
                variants={fadeInUp}
                className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-10"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>10-15 минут</span>
                </div>
                <span className="text-slate-700">•</span>
                <span>25 вопросов</span>
                <span className="text-slate-700">•</span>
                <span>14 профессий</span>
            </motion.div>

            <motion.div
                variants={fadeInUp}
                className="grid md:grid-cols-3 gap-4 mb-10"
            >
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                        <feature.icon className="w-8 h-8 text-violet-400 mb-4 mx-auto" />
                        <h3 className="text-white font-medium mb-2">{feature.title}</h3>
                        <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Button
                    variant="primary"
                    size="lg"
                    onClick={onStart}
                    disabled={isLoading}
                    className="min-w-[200px]"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Загрузка...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Начать тест
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>
            </motion.div>
        </motion.div>
    );
};

export default WelcomeScreen;
