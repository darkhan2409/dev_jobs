import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, Compass, Sparkles } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { pageVariants } from '../utils/animations';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const ALLOWED_SOURCES = new Set(['header', 'homepage', 'direct']);

const StartPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const source = useMemo(() => {
        const querySource = searchParams.get('source');
        if (ALLOWED_SOURCES.has(querySource)) return querySource;

        const stateSource = location.state?.source;
        if (ALLOWED_SOURCES.has(stateSource)) return stateSource;

        if (typeof window !== 'undefined' && document.referrer) {
            try {
                const referrerUrl = new URL(document.referrer);
                if (referrerUrl.origin === window.location.origin && referrerUrl.pathname === '/') {
                    return 'homepage';
                }
            } catch {
                // Ignore malformed referrer values and keep fallback behavior.
            }
        }

        return 'direct';
    }, [location.state, searchParams]);

    const trackStartClick = (eventName, extraProps = {}) => {
        trackEvent(eventName, {
            source,
            route: location.pathname,
            ...extraProps
        });
    };

    const handleJobsModeClick = () => {
        trackStartClick(ANALYTICS_EVENTS.START_MODE_JOBS_CLICK, { destination: '/jobs' });
        navigate('/jobs');
    };

    const handleNewbieModeClick = (destination) => {
        trackStartClick(ANALYTICS_EVENTS.START_MODE_NEWBIE_CLICK, { destination });
        navigate(destination);
    };

    return (
        <motion.main
            className="min-h-screen pt-24 pb-16 px-4"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-6xl mx-auto">
                <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-900/70 backdrop-blur-sm p-5 sm:p-7 md:p-10 mb-8">
                    <div className="absolute -top-24 -left-12 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-28 -right-12 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
                    <div className="relative">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-200 text-xs font-semibold uppercase tracking-wide">
                            <Sparkles size={14} />
                            Навигация по платформе
                        </span>
                        <h1 className="mt-4 text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-tight">
                            С чего начать в{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                                GitJob
                            </span>
                        </h1>
                        <p className="mt-4 text-slate-300 max-w-3xl text-base md:text-lg leading-relaxed">
                            Выберите удобный режим: сразу перейти к поиску IT-вакансий или спокойно пройти обучающий путь с тестом и картой профессий.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-slate-900/60 p-4 sm:p-6 md:p-7">
                        <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-200 flex items-center justify-center">
                            <BriefcaseBusiness size={20} />
                        </div>
                        <h2 className="mt-5 text-2xl font-semibold text-white">Ищу IT-вакансии</h2>
                        <p className="mt-3 text-slate-300">
                            Основной путь платформы: быстро перейти к каталогу вакансий, фильтрам и откликам.
                        </p>
                        <Button
                            onClick={handleJobsModeClick}
                            className="mt-6 w-full md:w-auto"
                            icon={ArrowRight}
                        >
                            Перейти к вакансиям
                        </Button>
                    </section>

                    <section className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-900/60 p-4 sm:p-6 md:p-7">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 flex items-center justify-center">
                            <Compass size={20} />
                        </div>
                        <h2 className="mt-5 text-2xl font-semibold text-white">Я новичок, хочу разобраться</h2>
                        <p className="mt-3 text-slate-300">
                            Обучающий режим без давления отклика: начните с карьерного теста или сразу откройте карту профессий.
                        </p>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                onClick={() => handleNewbieModeClick('/career')}
                            >
                                Пройти карьерный тест
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto text-cyan-200 hover:text-white hover:bg-cyan-500/15"
                                onClick={() => handleNewbieModeClick('/guide')}
                            >
                                Открыть карту профессий
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </motion.main>
    );
};

export default StartPage;
