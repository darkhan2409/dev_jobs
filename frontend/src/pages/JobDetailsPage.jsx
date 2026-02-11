import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vacanciesApi } from '../api/vacanciesApi';
import { formatSalary, formatDate } from '../utils/formatters';
import { parseJobDescription } from '../utils/jobParser';
import TableOfContents from '../components/job/TableOfContents';
import JobDescription from '../components/job/JobDescription';
import {
    MapPin,
    Building2,
    ExternalLink,
    Clock,
    Briefcase,
    Award,
    Users,
    Database,
    CalendarClock
} from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { pageVariants } from '../utils/animations';
import { getVacancySourceLabel, formatVacancyUpdatedAt } from '../utils/vacancyTrust';

const QuickStat = ({ icon, label, value }) => {
    const Icon = icon;
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="p-2 rounded-md bg-slate-800 text-violet-400">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-200">{value}</p>
            </div>
        </div>
    );
};

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vacancy, setVacancy] = useState(null);
    const [status, setStatus] = useState('loading');
    const [statusMessage, setStatusMessage] = useState('');

    const loadVacancy = useCallback(async () => {
        setStatus('loading');
        setStatusMessage('');

        try {
            const response = await vacanciesApi.getById(id);
            if (!response.data) {
                setVacancy(null);
                setStatus('empty');
                setStatusMessage('Вакансия не найдена или больше неактивна.');
                return;
            }

            setVacancy(response.data);
            setStatus('ready');
        } catch (error) {
            console.error('Failed to fetch vacancy:', error);
            setVacancy(null);

            if (error?.response?.status === 404) {
                setStatus('empty');
                setStatusMessage('Вакансия не найдена или уже закрыта.');
                return;
            }

            setStatus('error');
            setStatusMessage('Не удалось загрузить вакансию. Проверьте соединение и попробуйте снова.');
        }
    }, [id]);

    useEffect(() => {
        loadVacancy();
    }, [loadVacancy]);

    useEffect(() => {
        if (vacancy) {
            document.title = `${vacancy.title} | GitJob`;
        }

        return () => {
            document.title = 'GitJob — IT-вакансии в Казахстане';
        };
    }, [vacancy]);

    const sections = useMemo(() => {
        return vacancy ? parseJobDescription(vacancy.description) : [];
    }, [vacancy]);

    if (status === 'loading' && !vacancy) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <LoadingState
                    title="Загружаем вакансию"
                    message="Получаем описание, требования и условия отклика."
                />
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <ErrorState
                    title="Не удалось загрузить вакансию"
                    message={statusMessage}
                    onRetry={loadVacancy}
                    showHomeLink={false}
                />
            </div>
        );
    }

    if (status === 'empty' || !vacancy) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <EmptyState
                    title="Вакансия не найдена"
                    message={statusMessage || 'Возможно, вакансия закрыта или удалена.'}
                    actionLabel="Вернуться к вакансиям"
                    onAction={() => navigate('/jobs')}
                />
            </div>
        );
    }

    const sourceLabel = getVacancySourceLabel(vacancy);
    const updatedAtLabel = formatVacancyUpdatedAt(vacancy);

    return (
        <motion.div
            className="min-h-screen text-slate-200 font-sans pb-24 lg:pb-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="border-b border-white/5 pt-24 pb-12">
                <main className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                        <Link to="/jobs" className="hover:text-white transition-colors">Вакансии</Link>
                        <span>/</span>
                        <span className="text-slate-300 truncate max-w-[300px]">{vacancy.title}</span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
                        <div className="space-y-6 max-w-3xl">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden p-2 shadow-lg shadow-violet-500/10">
                                    {vacancy.company_logo ? (
                                        <img src={vacancy.company_logo} alt={vacancy.company_name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 size={32} className="text-slate-800" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                        {vacancy.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-slate-400">
                                        <Building2 size={16} className="text-violet-400" />
                                        <span className="font-medium text-slate-200">{vacancy.company_name}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <MapPin size={16} />
                                        <span>{vacancy.location || 'Удалённо'}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="text-sm">Опубликовано {formatDate(vacancy.published_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {vacancy.key_skills?.slice(0, 5).map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-3">
                                <p className="text-xs text-slate-400">Данные вакансии получены из HH API и обновляются по мере синхронизации источника.</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Database size={14} className="text-violet-400" />
                                        Источник: {sourceLabel}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarClock size={14} className="text-violet-400" />
                                        Обновлено: {updatedAtLabel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="lg:text-right">
                            <div className="text-2xl md:text-3xl font-mono font-bold text-emerald-400 mb-2">
                                {formatSalary(vacancy.salary_from, vacancy.salary_to, vacancy.currency || 'KZT')}
                            </div>
                            <div className="text-sm text-slate-500">В месяц, до вычета налогов</div>
                        </div>
                    </div>
                </main>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                    <div className="hidden lg:block lg:col-span-3">
                        <TableOfContents sections={sections} />
                    </div>

                    <div className="lg:col-span-6 space-y-8">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <QuickStat
                                icon={Briefcase}
                                label="Опыт"
                                value={vacancy.raw_data?.experience?.name || 'Не указано'}
                            />
                            <QuickStat
                                icon={Clock}
                                label="График"
                                value={vacancy.raw_data?.schedule?.name || 'Полная занятость'}
                            />
                            <QuickStat
                                icon={Users}
                                label="Размер команды"
                                value="Неизвестно"
                            />
                            <QuickStat
                                icon={Award}
                                label="Уровень"
                                value={vacancy.raw_data?.professional_roles?.[0]?.name || 'Специалист'}
                            />
                        </div>

                        <div className="space-y-6">
                            {sections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-32"
                                >
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                                        {section.title}
                                    </h3>
                                    <JobDescription htmlContent={section.content} />
                                </section>
                            ))}
                        </div>
                    </div>

                    <aside className="lg:col-span-3 relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="p-6 rounded-2xl bg-gradient-to-b from-violet-500/10 to-slate-900 border border-violet-500/20 shadow-xl shadow-black/20 backdrop-blur-sm">
                                <h3 className="font-semibold text-white mb-4">Заинтересовало?</h3>
                                <a
                                    href={vacancy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full mb-4"
                                >
                                    <button className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2">
                                        Откликнуться <ExternalLink size={18} />
                                    </button>
                                </a>
                                <p className="text-xs text-center text-slate-500">
                                    Переход на источник: {sourceLabel}
                                </p>
                                <p className="text-[11px] text-center text-slate-600 mt-2">
                                    Данные карточки синхронизируются из HH API.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                    О компании
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                            <Building2 size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{vacancy.company_name}</p>
                                            <p className="text-xs text-slate-500">IT-компания</p>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/companies/${encodeURIComponent(vacancy.company_name)}`}
                                        className="block w-full text-center py-2 text-sm text-violet-400 hover:text-white border border-violet-500/30 hover:bg-violet-500/10 rounded-lg transition-all"
                                    >
                                        Профиль компании
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4 z-50">
                <a
                    href={vacancy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <button className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <span>Откликнуться</span>
                        <ExternalLink size={18} />
                    </button>
                </a>
            </div>
        </motion.div>
    );
};

export default JobDetailsPage;
