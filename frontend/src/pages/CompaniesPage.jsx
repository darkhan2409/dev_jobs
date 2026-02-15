import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Briefcase, TrendingUp, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { fadeInUp, staggerContainer } from '../utils/animations';
import Pagination from '../components/ui/Pagination';
import CompanyCard from '../components/CompanyCard';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('active');
    const [searchParams, setSearchParams] = useSearchParams();
    const [pendingPage, setPendingPage] = useState(null);
    const [isPageTransitioning, setIsPageTransitioning] = useState(false);

    const navigate = useNavigate();
    const listRef = React.useRef(null);
    const perPage = 20;

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.get('/companies?limit=100');
            setCompanies(response.data.items || []);
        } catch (loadError) {
            console.error('Failed to load companies:', loadError);
            setCompanies([]);
            setError('Не удалось загрузить список компаний. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const filteredCompanies = useMemo(() => {
        let result = [...companies];

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter((company) => company.name.toLowerCase().includes(lowerTerm));
        }

        if (sortBy === 'active') {
            result.sort((a, b) => b.vacancy_count - a.vacancy_count);
        } else if (sortBy === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [companies, searchTerm, sortBy]);

    const page = parseInt(searchParams.get('page'), 10) || 1;
    const totalPages = Math.ceil(filteredCompanies.length / perPage) || 1;
    const paginatedCompanies = filteredCompanies.slice(
        (page - 1) * perPage,
        page * perPage
    );
    const visibleFrom = filteredCompanies.length === 0 ? 0 : (page - 1) * perPage + 1;
    const visibleTo = filteredCompanies.length === 0 ? 0 : Math.min(page * perPage, filteredCompanies.length);

    const setPage = (nextPage, replace = false) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

        setPendingPage(nextPage);
        const newParams = new URLSearchParams(searchParams);

        if (nextPage <= 1) {
            newParams.delete('page');
        } else {
            newParams.set('page', nextPage.toString());
        }

        setSearchParams(newParams, { replace });
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        if (page !== 1) {
            setPage(1, true);
        }
    };

    const handleSortChange = (nextSort) => {
        setSortBy(nextSort);
        if (page !== 1) {
            setPage(1, true);
        }
    };

    useEffect(() => {
        setIsPageTransitioning(true);
        setPendingPage(null);
        const timerId = setTimeout(() => setIsPageTransitioning(false), 600);
        return () => clearTimeout(timerId);
    }, [page]);

    const stats = useMemo(() => {
        return {
            totalCompanies: companies.length,
            totalVacancies: companies.reduce((acc, curr) => acc + curr.vacancy_count, 0),
            topHiring: companies.filter((company) => company.vacancy_count >= 5).length
        };
    }, [companies]);

    const handleOpenProfile = (companyId) => {
        navigate(`/companies/${companyId}`);
    };

    const handleViewJobs = (companyName) => {
        navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
    };

    if (loading && companies.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <LoadingState
                    title="Загружаем компании"
                    message="Подбираем работодателей и актуальные вакансии."
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <ErrorState
                    title="Не удалось загрузить компании"
                    message={error}
                    onRetry={fetchCompanies}
                    showHomeLink={false}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="mb-8"
                >
                    <motion.div variants={fadeInUp} className="mb-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                            Лучшие <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">IT-компании</span>
                        </h1>
                        <p className="text-base text-slate-400 max-w-2xl">
                            Найдите сильные инженерные команды в Казахстане — от быстрорастущих стартапов до крупных компаний.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-wrap items-center gap-6 md:gap-8 mb-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-lg">
                                <Building2 className="text-violet-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{stats.totalCompanies}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Компаний</p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-white/10"></div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Briefcase className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{stats.totalVacancies}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Вакансий</p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-white/10"></div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <TrendingUp className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{stats.topHiring}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Активно нанимают</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col md:flex-row gap-3 items-stretch md:items-center max-w-4xl mx-auto w-full"
                    >
                        <div className="flex-1">
                            <Input
                                placeholder="Поиск компании..."
                                icon={Search}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="h-12 bg-[#1A1B26] border border-white/20 hover:border-violet-500/50 focus:border-violet-500 text-white placeholder:text-slate-500"
                            />
                        </div>

                        <div className="flex gap-2 bg-[#1A1B26] border border-white/20 rounded-xl p-1">
                            <Button
                                variant={sortBy === 'active' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handleSortChange('active')}
                                className="flex-1 md:flex-none"
                            >
                                По активности
                            </Button>
                            <Button
                                variant={sortBy === 'name' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => handleSortChange('name')}
                                className="flex-1 md:flex-none"
                            >
                                По алфавиту
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>

                {filteredCompanies.length === 0 ? (
                    <EmptyState
                        title="Компании не найдены"
                        message="Попробуйте изменить поисковый запрос или сбросить фильтр сортировки."
                        actionLabel={searchTerm ? 'Сбросить поиск' : undefined}
                        onAction={searchTerm ? () => setSearchTerm('') : undefined}
                    />
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-sm text-slate-400">
                                Показаны {visibleFrom}-{visibleTo} из {filteredCompanies.length}. Страница {page} из {totalPages}.
                            </p>
                            {isPageTransitioning && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-md text-violet-300 text-xs font-medium animate-pulse">
                                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Загрузка страницы {pendingPage || '...'}
                                </span>
                            )}
                        </div>

                        <div ref={listRef} className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-500 ${isPageTransitioning ? 'opacity-30' : 'opacity-100'}`}>
                            <AnimatePresence mode="popLayout">
                                {paginatedCompanies.map((company) => (
                                    <motion.div
                                        key={company.name}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CompanyCard
                                            company={company}
                                            onOpenProfile={handleOpenProfile}
                                            onViewJobs={handleViewJobs}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            isLoading={isPageTransitioning}
                            pendingPage={pendingPage}
                            onPageChange={(newPage) => {
                                setPage(newPage);
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
