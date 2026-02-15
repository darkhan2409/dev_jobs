import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vacanciesApi } from '../api/vacanciesApi';
import { formatSalary, formatDate } from '../utils/formatters';
import JobDescription from '../components/job/JobDescription';
import {
    MapPin,
    Building2,
    ExternalLink,
    Clock,
    Briefcase,
    Calendar,
    Share2
} from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import LoadingState from '../components/ui/LoadingState';
import { pageVariants } from '../utils/animations';
import { getVacancySourceLabel } from '../utils/vacancyTrust';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const JobDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const prefetchedVacancy = useMemo(() => {
        const candidate = location.state?.prefetchedVacancy;
        if (!candidate) return null;
        return String(candidate.id) === String(id) ? candidate : null;
    }, [id, location.state]);

    const [vacancy, setVacancy] = useState(prefetchedVacancy);
    const [status, setStatus] = useState(prefetchedVacancy ? 'ready' : 'loading');
    const [statusMessage, setStatusMessage] = useState('');
    const trackedVacancyRef = useRef(null);

    const loadVacancy = useCallback(async ({ silent = false } = {}) => {
        if (!silent) {
            setStatus('loading');
        }
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
        const timer = setTimeout(() => {
            loadVacancy({ silent: Boolean(prefetchedVacancy) });
        }, 0);

        return () => clearTimeout(timer);
    }, [loadVacancy, prefetchedVacancy]);

    useEffect(() => {
        if (vacancy) {
            document.title = `${vacancy.title} | GitJob`;
        }

        return () => {
            document.title = 'GitJob — IT-вакансии в Казахстане';
        };
    }, [vacancy]);

    useEffect(() => {
        if (!vacancy || status !== 'ready') return;
        if (trackedVacancyRef.current === vacancy.id) return;

        trackEvent(ANALYTICS_EVENTS.VACANCY_OPEN, {
            source: 'job_details_page',
            vacancy_id: vacancy.id,
            company_id: vacancy.company_id || null,
            grade: vacancy.grade || null,
        });
        trackedVacancyRef.current = vacancy.id;
    }, [vacancy, status]);

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

    return (
        <motion.div
            className="min-h-screen text-slate-200 font-sans pb-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <main className="max-w-7xl mx-auto px-4 pt-24">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                    <Link to="/jobs" className="hover:text-white transition-colors">Вакансии</Link>
                    <span>/</span>
                    <span className="text-slate-300 truncate max-w-[300px]">{vacancy.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN (70%) - Header & Description */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Unified Header Block */}
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                {vacancy.title}
                            </h1>

                            <div className="text-2xl md:text-3xl font-mono font-bold text-emerald-400 mb-6">
                                {formatSalary(vacancy.salary_from, vacancy.salary_to, vacancy.currency || 'KZT')}
                                <span className="text-sm font-sans font-normal text-slate-500 ml-3 align-middle">
                                    до вычета налогов
                                </span>
                            </div>

                            {/* Meta Info Row */}
                            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm text-slate-300 border-b border-slate-800 pb-8">
                                <div className="flex items-center gap-2">
                                    <Briefcase size={18} className="text-slate-500" />
                                    <span>{vacancy.raw_data?.experience?.name || 'Опыт не указан'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-slate-500" />
                                    <span>{vacancy.raw_data?.schedule?.name || 'Полный день'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} className="text-slate-500" />
                                    <span>{vacancy.location || 'Город не указан'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-slate-500" />
                                    <span>Опубликовано {formatDate(vacancy.published_at)}</span>
                                </div>
                            </div>

                            {/* Key Skills Tags */}
                            {vacancy.key_skills && vacancy.key_skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {vacancy.key_skills.map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Full Description */}
                        <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                            <JobDescription htmlContent={vacancy.description} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN (30%) - Sticky Actions */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        {/* Apply Card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-b from-violet-500/10 to-slate-900 border border-violet-500/20 shadow-xl shadow-black/20 backdrop-blur-sm">
                            <a
                                href={vacancy.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() =>
                                    trackEvent(ANALYTICS_EVENTS.APPLY_CLICK, {
                                        source: 'job_details_page',
                                        vacancy_id: vacancy.id,
                                        company_id: vacancy.company_id || null,
                                    })
                                }
                                className="block w-full mb-4"
                            >
                                <button className="w-full py-3.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 group">
                                    <span>Откликнуться</span>
                                    <ExternalLink size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </button>
                            </a>

                            <div className="flex justify-between items-center px-1">
                                <p className="text-xs text-slate-500">
                                    Источник: {sourceLabel}
                                </p>
                                <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Company Card */}
                        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                                    {vacancy.company_logo ? (
                                        <img src={vacancy.company_logo} alt={vacancy.company_name} className="w-full h-full object-contain" />
                                    ) : (
                                        <Building2 size={24} className="text-slate-800" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white leading-tight">
                                        {vacancy.company_name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">IT-компания</p>
                                </div>
                            </div>

                            {vacancy.company_id && (
                                <Link
                                    to={`/companies/${vacancy.company_id}`}
                                    className="block w-full text-center py-2.5 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    Подробнее о компании
                                </Link>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </motion.div>
    );
};

export default JobDetailsPage;
