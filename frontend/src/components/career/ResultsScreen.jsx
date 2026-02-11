import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, RefreshCw, Briefcase, Sparkles, AlertTriangle, TrendingUp, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { interviewApi } from '../../api/interviewApi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import SignalChart from './SignalChart';
import StageResultCard from './StageResultCard';
import { fadeInUp, staggerContainer } from '../../utils/animations';

// Helper function to split text into readable paragraphs
const splitIntoParagraphs = (text) => {
    if (!text) return [];

    // First try splitting by double newlines
    if (text.includes('\n\n')) {
        return text.split('\n\n').map(p => p.trim()).filter(Boolean);
    }

    // Try splitting by single newlines
    if (text.includes('\n')) {
        return text.split('\n').map(p => p.trim()).filter(Boolean);
    }

    // Split by sentences - each sentence becomes a paragraph for better readability
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());

    // If only 1 sentence, return as is
    if (sentences.length <= 1) {
        return [text];
    }

    // Return each sentence as separate paragraph
    return sentences;
};

const roleNames = {
    backend_developer: 'Backend-разработчик',
    frontend_developer: 'Frontend-разработчик',
    fullstack_developer: 'Fullstack-разработчик',
    ml_engineer: 'ML-инженер',
    llm_engineer: 'LLM-инженер',
    devops_engineer: 'DevOps-инженер',
    data_engineer: 'Data-инженер',
    data_analyst: 'Аналитик данных',
    qa_engineer: 'QA-инженер',
    security_engineer: 'Инженер по безопасности',
    mobile_developer: 'Мобильный разработчик',
    game_developer: 'Разработчик игр',
    systems_architect: 'Системный архитектор',
    product_manager: 'Продакт-менеджер',
    technical_writer: 'Технический писатель',
    ui_ux_researcher: 'UI/UX-исследователь'
};

const ResultsScreen = ({ results, onRestart }) => {
    const { ranked_roles, signal_profile, interpretation, ranked_stages, stage_recommendation } = results;
    const [roleDetails, setRoleDetails] = useState(null);
    const [nextSteps, setNextSteps] = useState([]);
    const [isRoleDetailsLoading, setIsRoleDetailsLoading] = useState(false);
    const [roleDetailsError, setRoleDetailsError] = useState(false);
    const [nextStepsError, setNextStepsError] = useState(false);

    const primaryRoleId = ranked_roles?.[0]?.role_id;

    // Fallback name if API fails or loading
    const primaryRoleName = roleNames[primaryRoleId] || 'IT‑специалист';

    const fetchSupplementaryData = useCallback(async () => {
        if (!primaryRoleId) return;

        setIsRoleDetailsLoading(true);
        setRoleDetailsError(false);
        setNextStepsError(false);

        const [roleRes, nextRes] = await Promise.allSettled([
            interviewApi.getRoleDetails(primaryRoleId),
            interviewApi.getNextSteps(primaryRoleId)
        ]);

        if (roleRes.status === 'fulfilled') {
            setRoleDetails(roleRes.value.data);
        } else {
            setRoleDetails(null);
            setRoleDetailsError(true);
            console.error('Failed to fetch role details:', roleRes.reason);
        }

        if (nextRes.status === 'fulfilled') {
            setNextSteps(nextRes.value.data);
        } else {
            setNextSteps([]);
            setNextStepsError(true);
            console.error('Failed to fetch next steps:', nextRes.reason);
        }

        setIsRoleDetailsLoading(false);
    }, [primaryRoleId]);

    // Fetch detailed info for the top role
    useEffect(() => {
        fetchSupplementaryData();
    }, [fetchSupplementaryData]);

    const topRoles = ranked_roles?.slice(0, 5) || [];
    const alternativeRoles = interpretation?.alternative_roles || [];

    return (
        <motion.div
            className="max-w-4xl mx-auto space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
        >
            {/* Hero Result Card */}
            <motion.div
                variants={fadeInUp}
                className="text-center"
            >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-6">
                    <Trophy className="w-10 h-10 text-amber-400" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Ваша IT-профессия
                </h1>
                <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 backdrop-blur-sm">
                    <span className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        {roleDetails?.name || primaryRoleName}
                    </span>
                </div>
                {roleDetails?.description && (
                    <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        {roleDetails.description}
                    </p>
                )}
                {!roleDetails?.description && isRoleDetailsLoading && (
                    <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Загружаем подробный профиль роли...
                    </p>
                )}
                {roleDetailsError && (
                    <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        Детальный профиль роли временно недоступен. Ниже доступны результаты теста и учебный следующий шаг.
                    </p>
                )}
            </motion.div>

            {/* Learning First: What to Learn Next */}
            {stage_recommendation && (
                <div className="space-y-3">
                    <motion.div variants={fadeInUp} className="text-center">
                        <h2 className="text-2xl md:text-3xl font-semibold text-white">Что изучить дальше</h2>
                        <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
                            Начните с рекомендованного этапа и соберите базу практики до перехода к поиску вакансий.
                        </p>
                    </motion.div>
                    <StageResultCard
                        stageRecommendation={stage_recommendation}
                        rankedStages={ranked_stages}
                    />
                </div>
            )}

            {(roleDetailsError || nextStepsError) && (
                <motion.div
                    variants={fadeInUp}
                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm">
                            {roleDetailsError && nextStepsError
                                ? 'Не удалось загрузить расширенные детали роли и карьерный рост. Базовые результаты сохранены.'
                                : roleDetailsError
                                    ? 'Не удалось загрузить расширенные детали роли. Базовые результаты сохранены.'
                                    : 'Не удалось загрузить блок карьерного роста. Можно продолжить или повторить загрузку.'}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchSupplementaryData}
                            isLoading={isRoleDetailsLoading}
                        >
                            Повторить загрузку
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Responsibilities */}
                {roleDetails?.responsibilities?.length > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
                    >
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-sky-400" />
                            Чем предстоит заниматься
                        </h3>
                        <ul className="space-y-3">
                            {roleDetails.responsibilities.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                    <CheckCircle className="w-5 h-5 text-emerald-500/50 flex-shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}

                {/* 2. Key Signals Analysis */}
                {interpretation?.explanation && (
                    <motion.div
                        variants={fadeInUp}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
                    >
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            Почему это ваш выбор
                        </h3>
                        <div className="text-slate-300 leading-relaxed mb-4 space-y-3">
                            {splitIntoParagraphs(interpretation.explanation).map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                        {roleDetails?.entry_difficulty && (
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <span className="text-sm text-slate-500">Сложность входа: </span>
                                <span className={`text-sm font-medium px-2 py-1 rounded ml-2 ${roleDetails.entry_difficulty === 'junior'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : roleDetails.entry_difficulty === 'mid'
                                        ? 'bg-amber-500/20 text-amber-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {roleDetails.entry_difficulty === 'junior' ? 'Низкая (Junior)' :
                                        roleDetails.entry_difficulty === 'mid' ? 'Средняя (Mid)' : 'Высокая (Senior only)'}
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Interpretation Methodology */}
            <motion.div
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
            >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-300" />
                    Как интерпретировать результат
                </h3>
                <div className="space-y-3 text-slate-300 leading-relaxed">
                    <p>
                        Смотрите на топ ролей как на диапазон возможных направлений, а не как на единственный правильный выбор.
                    </p>
                    <p>
                        Сопоставьте рекомендации с вашими интересами и попробуйте мини-практику: это лучший способ проверить гипотезу.
                    </p>
                    <p className="text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        Важно: тест дает рекомендацию, не диагноз. Финальное решение лучше принимать после практических задач и изучения роли.
                    </p>
                </div>
                <Link
                    to="/guide"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                    Открыть карту профессий
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>

            {/* 3. Career Growth Path */}
            {nextSteps.length > 0 && (
                <motion.div
                    variants={fadeInUp}
                    className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800/50 border border-slate-700"
                >
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                        Карьерный рост
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nextSteps.map((step, idx) => (
                            <div key={idx} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/30 transition-colors">
                                <div className="text-indigo-300 font-medium mb-1">
                                    {roleNames[step.to] || step.to}
                                </div>
                                <div className="text-sm text-slate-500 mb-2">
                                    Через {step.avg_transition_years} года
                                </div>
                                <div className="text-sm text-slate-400">
                                    {step.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* 4. Red Flags (Warning) */}
            {roleDetails?.red_flags?.length > 0 && (
                <motion.div
                    variants={fadeInUp}
                    className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20"
                >
                    <h3 className="text-xl font-semibold text-red-200 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Вам может быть скучно, если...
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roleDetails.red_flags.map((flag, i) => (
                            <li key={i} className="flex items-center gap-3 text-red-200/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                                <span>{flag}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 5. Signal Chart */}
                {signal_profile && Object.keys(signal_profile).length > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
                    >
                        <h3 className="text-lg font-medium text-white mb-4">Карта компетенций</h3>
                        <SignalChart signalProfile={signal_profile} />
                    </motion.div>
                )}

                {/* 6. Top Recommendations */}
                {topRoles.length > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
                    >
                        <h3 className="text-lg font-medium text-white mb-4">
                            Топ-5 подходящих профессий
                        </h3>
                        <div className="space-y-4">
                            {topRoles.map(({ role_id, score }, index) => (
                                <div
                                    key={role_id}
                                    className="relative"
                                >
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className={index === 0 ? 'text-amber-400 font-medium' : 'text-slate-300'}>
                                            {roleNames[role_id] || role_id}
                                        </span>
                                        <span className="text-slate-500">{Math.round(score * 100)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score * 100}%` }}
                                            transition={{ duration: 0.8, delay: index * 0.1 }}
                                            className={`h-full rounded-full ${index === 0
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                : 'bg-slate-600'
                                                }`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Alternative Variants */}
            {alternativeRoles.length > 0 && (
                <motion.div
                    variants={fadeInUp}
                    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center"
                >
                    <h3 className="text-lg font-medium text-white mb-4">
                        Также стоит рассмотреть
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {alternativeRoles.map((role) => (
                            <Badge key={role} variant="secondary">
                                {role}
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-slate-800/50"
            >
                <Button
                    variant="ghost"
                    onClick={onRestart}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Пройти заново
                </Button>
            </motion.div>

            {/* Optional Jobs Bridge */}
            <motion.div
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center"
            >
                <p className="text-slate-300">
                    Когда будете готовы, можно посмотреть вакансии по этому направлению.
                </p>
                <Link to="/jobs" className="inline-block mt-4">
                    <Button variant="outline" className="px-8">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Посмотреть вакансии (опционально)
                    </Button>
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default ResultsScreen;
