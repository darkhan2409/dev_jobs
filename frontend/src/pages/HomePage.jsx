import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import MetricsSection from '../components/MetricsSection';
import VacancyShowcase from '../features/vacancies/VacancyShowcase';
import RecommendedSection from '../features/vacancies/RecommendedSection';
import BackToTop from '../components/BackToTop';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { pageVariants } from '../utils/animations';

const HomePage = () => {
    const navigate = useNavigate();
    const [totalJobs, setTotalJobs] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axiosClient.get('/metrics');
                setTotalJobs(response.data.total_count);
            } catch (error) {
                console.error('Failed to fetch metrics for hero:', error);
            }
        };
        fetchMetrics();
    }, []);

    const handleSearch = (filters) => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.location) params.set('location', filters.location);
        navigate(`/jobs?${params.toString()}`);
    };

    const handleStartJourney = () => {
        navigate('/start?source=homepage');
    };

    return (
        <motion.main
            className="flex-grow font-sans text-slate-100 overflow-x-hidden relative selection:bg-violet-500/30"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <HeroSection
                onSearchApply={handleSearch}
                totalJobs={totalJobs}
            />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <p className="text-cyan-200 font-semibold text-sm uppercase tracking-wide">Для новичков</p>
                        <h2 className="text-white text-xl md:text-2xl font-semibold mt-1">Нужен спокойный старт в IT?</h2>
                        <p className="text-slate-300 mt-2">Откройте развилку режимов и выберите путь: вакансии сразу или обучение без давления отклика.</p>
                    </div>
                    <button
                        onClick={handleStartJourney}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/20 hover:bg-cyan-500/30 px-4 py-2.5 text-white font-medium transition-colors"
                    >
                        С чего начать
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>
            <RecommendedSection />
            <VacancyShowcase />
            <MetricsSection />
            <InfoSection />
            <BackToTop />
        </motion.main>
    );
};

export default HomePage;
