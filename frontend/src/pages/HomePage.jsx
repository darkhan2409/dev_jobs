import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import MetricsSection from '../components/MetricsSection';
import VacancyShowcase from '../features/vacancies/VacancyShowcase';
import RecommendedSection from '../features/vacancies/RecommendedSection';
import BackToTop from '../components/BackToTop';
// import { AnimatePresence } from 'framer-motion'; // Removed unused import
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

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

    return (
        <main className="flex-grow font-sans text-slate-100 overflow-x-hidden relative selection:bg-violet-500/30">
            <HeroSection
                onSearchApply={handleSearch}
                totalJobs={totalJobs}
            />
            <RecommendedSection />
            <VacancyShowcase />
            <MetricsSection />
            <InfoSection />
            <BackToTop />
        </main>
    );
};

export default HomePage;
