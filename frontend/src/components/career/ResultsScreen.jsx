import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Briefcase, BriefcaseBusiness, Building2, Medal, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../../api/interviewApi';

const roleNames = {
    product_manager: 'Продакт-менеджер',
    uiux_designer: 'UI/UX-дизайнер',
    frontend_developer: 'Frontend-разработчик',
    backend_developer: 'Backend-разработчик',
    ai_data_engineer: 'AI/Data-инженер',
    qa_engineer: 'QA-инженер',
    devops_engineer: 'DevOps-инженер',
};

const roleSubtitles = {
    product_manager: 'Исследование и планирование',
    uiux_designer: 'Дизайн без кода',
    frontend_developer: 'Визуальный код',
    backend_developer: 'Логика и данные',
    ai_data_engineer: 'Математика и данные',
    qa_engineer: 'Качество и тесты',
    devops_engineer: 'Инфраструктура и автоматизация',
};

const ANALYSIS_BLOCK_FALLBACK_TITLES = [
    'Почему тебе подходит роль',
    'Твои сильные качества',
    'Как это проявится в работе',
    'С чего начать в 2026',
];

const MEDAL_STYLES = [
    {
        ring: 'border-amber-300/65',
        bg: 'bg-amber-300/15',
        icon: 'text-amber-300',
    },
    {
        ring: 'border-slate-300/65',
        bg: 'bg-slate-300/15',
        icon: 'text-slate-200',
    },
    {
        ring: 'border-orange-300/65',
        bg: 'bg-orange-300/15',
        icon: 'text-orange-300',
    },
];

const splitExplanationParagraphs = (text) => {
    if (!text) return [];
    let paragraphs = [];
    if (text.includes('\n\n')) {
        paragraphs = text.split('\n\n').map((p) => p.trim()).filter(Boolean);
    } else if (text.includes('\n')) {
        paragraphs = text.split('\n').map((p) => p.trim()).filter(Boolean);
    } else {
        paragraphs = [text.trim()];
    }

    // If model returns one long paragraph, split it into short readable blocks.
    if (paragraphs.length === 1) {
        const sentences = (paragraphs[0].match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
            .map((s) => s.trim())
            .filter(Boolean);

        if (sentences.length >= 4) {
            const blocks = [];
            for (let i = 0; i < sentences.length; i += 2) {
                blocks.push(sentences.slice(i, i + 2).join(' '));
            }
            return blocks;
        }
    }

    return paragraphs.filter(Boolean);
};

const parseAnalysisBlocks = (text) => {
    const paragraphs = splitExplanationParagraphs(text);
    if (paragraphs.length === 0) return [];

    return paragraphs.map((paragraph, index) => {
        const normalized = paragraph.replace(/\s+/g, ' ').trim();
        const colonMatch = normalized.match(/^(?:\d+[).]\s*)?([^:]{3,80}):\s*(.+)$/);
        const dashMatch = normalized.match(/^(?:\d+[).]\s*)?([^—-]{3,80})\s*[—-]\s*(.+)$/);

        if (colonMatch) {
            return {
                title: colonMatch[1].trim(),
                text: colonMatch[2].trim(),
            };
        }

        if (dashMatch) {
            return {
                title: dashMatch[1].trim(),
                text: dashMatch[2].trim(),
            };
        }

        return {
            title: ANALYSIS_BLOCK_FALLBACK_TITLES[index] || `Блок ${index + 1}`,
            text: normalized,
        };
    });
};

const formatMatchPercent = (score) => {
    const numeric = Number(score);
    if (!Number.isFinite(numeric)) return 0;
    const normalized = numeric <= 1 ? numeric * 100 : numeric;
    const clamped = Math.max(0, Math.min(100, normalized));
    return Math.round(clamped);
};

const formatKzt = (value) => {
    if (!value || value <= 0) return '—';
    return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        maximumFractionDigits: 0,
    }).format(value);
};

const ResultsScreen = ({ results }) => {
    const navigate = useNavigate();
    const [roleDetails, setRoleDetails] = useState(null);
    const [isRoleDetailsLoading, setIsRoleDetailsLoading] = useState(false);
    const [marketStats, setMarketStats] = useState(null);
    const [isMarketLoading, setIsMarketLoading] = useState(false);

    const sortedRoles = [...(results?.ranked_roles || [])].sort((a, b) => b.score - a.score);
    const primaryRole = sortedRoles[0] || { role_id: 'backend_developer', score: 0 };
    const primaryRoleId = primaryRole.role_id;
    const primaryRoleName = roleNames[primaryRoleId] || primaryRoleId;
    const primaryRoleSubtitle = roleSubtitles[primaryRoleId] || '';
    const topRoleMatches = (sortedRoles.length > 0 ? sortedRoles : [primaryRole])
        .slice(0, 3)
        .map((role) => ({
            roleId: role.role_id,
            label: roleNames[role.role_id] || role.role_id,
            percent: formatMatchPercent(role.score),
        }));

    const interpretation = results?.interpretation || null;

    useEffect(() => {
        const fetchRoleDetails = async () => {
            setIsRoleDetailsLoading(true);
            try {
                const response = await interviewApi.getRoleDetails(primaryRoleId);
                setRoleDetails(response.data);
            } catch (error) {
                console.error('Failed to fetch role details:', error);
                setRoleDetails(null);
            } finally {
                setIsRoleDetailsLoading(false);
            }
        };

        if (primaryRoleId) {
            fetchRoleDetails();
        }
    }, [primaryRoleId]);

    useEffect(() => {
        const fetchMarketStats = async () => {
            setIsMarketLoading(true);
            try {
                const response = await interviewApi.getMarketData(primaryRoleId);
                setMarketStats(response.data || null);
            } catch (error) {
                console.error('Failed to fetch market stats:', error);
                setMarketStats(null);
            } finally {
                setIsMarketLoading(false);
            }
        };

        if (primaryRoleId) {
            fetchMarketStats();
        }
    }, [primaryRoleId]);

    const analysisBlocks = parseAnalysisBlocks(interpretation?.explanation);
    const gradeOrder = ['Junior', 'Middle', 'Senior', 'Lead', 'Team Lead'];
    const salaryByGradeRows = Object.entries(marketStats?.salary_ranges_by_grade || {}).sort(([gradeA], [gradeB]) => {
        const idxA = gradeOrder.indexOf(gradeA);
        const idxB = gradeOrder.indexOf(gradeB);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
    const handleOpenJobs = () => {
        navigate(`/jobs?search=${encodeURIComponent(primaryRoleName)}`);
    };

    return (
        <div className="min-h-screen text-primary selection:bg-accent/30">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="space-y-6 md:space-y-7"
                >
                    <section className="text-center space-y-3 md:space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                Ваша IT-профессия
                            </span>
                        </h1>

                        <div className="inline-flex items-center justify-center rounded-full px-6 md:px-7 min-h-[3.2rem] md:min-h-[4.2rem] bg-gradient-to-r from-violet-600/35 to-violet-400/20 border border-violet-300/35 shadow-[0_0_22px_rgba(124,58,237,0.22)]">
                            <span className="inline-block text-2xl md:text-4xl font-bold leading-none text-purple-400 text-center whitespace-nowrap -translate-y-px md:-translate-y-0.5">
                                {primaryRoleName}
                            </span>
                        </div>

                        {primaryRoleSubtitle && (
                            <p className="mt-3 text-base md:text-lg font-semibold text-slate-300">{primaryRoleSubtitle}</p>
                        )}

                        {roleDetails?.description ? (
                            <p className="max-w-3xl mx-auto text-base md:text-lg text-slate-300 leading-relaxed">
                                {roleDetails.description}
                            </p>
                        ) : isRoleDetailsLoading ? (
                            <p className="text-slate-400">Загружаем описание роли...</p>
                        ) : null}

                        {topRoleMatches.length > 0 && (
                            <div className="w-full rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-slate-900/60 p-6 md:p-7 text-left">
                                <h2 className="text-2xl font-semibold text-white tracking-tight">
                                    Топ-3 профессии по совпадению
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Три самых близких направления по твоему текущему профилю.
                                </p>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {topRoleMatches.map((role, index) => {
                                        const medalStyle = MEDAL_STYLES[index] || MEDAL_STYLES[2];
                                        return (
                                            <article
                                                key={role.roleId}
                                                className={`relative rounded-xl border px-3.5 py-3.5 ${
                                                    index === 0
                                                        ? 'border-violet-300/45 bg-violet-500/12'
                                                        : 'border-violet-400/20 bg-slate-900/45'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-violet-200/90">
                                                        Топ {index + 1}
                                                    </p>
                                                    <span
                                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border ${medalStyle.ring} ${medalStyle.bg}`}
                                                        title={index === 0 ? 'Золото' : index === 1 ? 'Серебро' : 'Бронза'}
                                                    >
                                                        <Medal className={`h-4 w-4 ${medalStyle.icon}`} />
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm md:text-base font-semibold text-slate-100 leading-snug break-words">
                                                    {role.label}
                                                </p>

                                                <p className="mt-2 text-lg font-extrabold text-violet-100">
                                                    {role.percent}%
                                                </p>

                                                <div className="mt-2 h-1.5 rounded-full bg-slate-800/90 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
                                                        style={{ width: `${role.percent}%` }}
                                                    />
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-slate-900/60 p-6 md:p-7">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-200 flex items-center justify-center">
                                <Bot className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white tracking-tight">Профессиональный анализ</h2>
                        </div>

                        <div className="mt-4 space-y-2.5">
                            {analysisBlocks.length > 0 ? (
                                analysisBlocks.map((block, index) => (
                                    <blockquote key={index} className="rounded-xl border border-violet-400/20 bg-slate-900/45 px-4 py-3">
                                        <p className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-500/10 px-2 py-1 text-xs md:text-sm font-bold tracking-[0.06em] text-violet-100/95 mb-1.5">
                                            <Sparkles className="h-3.5 w-3.5 text-emerald-200/90" />
                                            {block.title}
                                        </p>
                                        <p className="text-slate-200 leading-relaxed text-sm md:text-base">
                                            {block.text}
                                        </p>
                                    </blockquote>
                                ))
                            ) : (
                                <blockquote className="rounded-xl border border-violet-400/20 bg-slate-900/45 px-4 py-3">
                                    <p className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-500/10 px-2 py-1 text-xs md:text-sm font-bold tracking-[0.06em] text-violet-100/95 mb-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-emerald-200/90" />
                                        Почему тебе подходит роль
                                    </p>
                                    <p className="text-slate-200 text-sm md:text-base leading-relaxed">
                                        По твоим ответам видно, что тебе подходит роль {primaryRoleName}: ты склонен к системному мышлению,
                                        понимаешь важность структуры и можешь уверенно двигаться в этом направлении.
                                    </p>
                                </blockquote>
                            )}

                            {interpretation?.signal_analysis && (
                                <div className="rounded-lg border border-violet-500/20 bg-slate-900/35 px-4 py-3">
                                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed italic">
                                        {interpretation.signal_analysis}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-violet-500/25 bg-gradient-to-br from-slate-900/70 to-slate-950/55 p-6 md:p-7">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-300/30 text-emerald-200 flex items-center justify-center">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white tracking-tight">Текущий спрос и зарплаты</h2>
                        </div>

                        {isMarketLoading ? (
                            <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-5 text-slate-400 text-sm">
                                Загружаем статистику вакансий...
                            </div>
                        ) : marketStats ? (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-violet-400/20 bg-slate-900/45 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-violet-200/85 mb-3">
                                        Спрос и компании
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-950/35 px-3 py-3">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Briefcase className="w-4 h-4 text-violet-300" />
                                                <span className="text-sm">Вакансий сейчас</span>
                                            </div>
                                            <span className="text-lg font-bold text-violet-100">
                                                {marketStats.vacancy_count ?? 0}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-950/35 px-3 py-3">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Building2 className="w-4 h-4 text-emerald-300" />
                                                <span className="text-sm">Компаний нанимают</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-base font-bold text-emerald-100">
                                                    {marketStats.companies_hiring_count ?? 0}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {marketStats.hiring_company_share_percent ?? 0}% от активного рынка
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-emerald-400/20 bg-slate-900/45 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200/90 mb-3">
                                        Зарплаты по грейдам
                                    </p>
                                    {salaryByGradeRows.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {salaryByGradeRows.map(([grade, salary]) => (
                                                <div key={grade} className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/60 bg-slate-950/35 px-3 py-2.5">
                                                    <span className="text-sm font-semibold text-slate-200">{grade}</span>
                                                    <span className="text-sm text-emerald-100">
                                                        {formatKzt(salary?.min)} - {formatKzt(salary?.max)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400">
                                            Для этой роли пока недостаточно данных по зарплатам.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/35 px-4 py-5 text-slate-400 text-sm">
                                Статистика рынка пока недоступна для этой роли.
                            </div>
                        )}
                    </section>

                    <div className="text-center pt-4">
                        <p className="text-sm text-slate-500 mb-2">
                            Интересно посмотреть реальные вакансии?
                        </p>
                        <button
                            onClick={handleOpenJobs}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                            <BriefcaseBusiness className="w-3.5 h-3.5" />
                            <span>Посмотреть открытые позиции</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResultsScreen;
