import { useState, useEffect, useCallback, useRef } from 'react';
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

const PER_PAGE = 20;

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('active');
    const [searchParams, setSearchParams] = useSearchParams();

    const navigate = useNavigate();
    const debounceRef = useRef(null);

    const page = parseInt(searchParams.get('page'), 10) || 1;

    const fetchCompanies = useCallback(async (currentPage, search, sort) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: PER_PAGE,
                sort,
            });
            if (search) params.set('search', search);

            const response = await axiosClient.get(`/companies?${params.toString()}`);
            setCompanies(response.data.items || []);
            setTotal(response.data.total || 0);
            setTotalPages(response.data.total_pages || 1);
        } catch (err) {
            console.error('Failed to load companies:', err);
            setCompanies([]);
            setError('Не удалось загрузить список компаний. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies(page, searchTerm, sortBy);
    }, [page, sortBy]);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('page');
            setSearchParams(newParams, { replace: true });
            fetchCompanies(1, value, sortBy);
        }, 400);
    };

    const handleSortChange = (nextSort) => {
        setSortBy(nextSort);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('page');
        setSearchParams(newParams, { replace: true });
    };

    const setPage = (nextPage) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
        const newParams = new URLSearchParams(searchParams);
        if (nextPage <= 1) {
            newParams.delete('page');
        } else {
            newParams.set('page', nextPage.toString());
        }
        setSearchParams(newParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const visibleFrom = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
    const visibleTo = total === 0 ? 0 : Math.min(page * PER_PAGE, total);

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
                    onRetry={() => fetchCompanies(page, searchTerm, sortBy)}
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
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
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
                                <p className="text-2xl font-bold text-white leading-none">{total}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Компаний</p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-white/10"></div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Briefcase className="text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{companies.reduce((acc, c) => acc + c.vacancy_count, 0)}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Вакансий на странице</p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-white/10"></div>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <TrendingUp className="text-emerald-400" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white leading-none">{companies.filter(c => c.vacancy_count >= 5).length}</p>
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

                {companies.length === 0 && !loading ? (
                    <EmptyState
                        title="Компании не найдены"
                        message="Попробуйте изменить поисковый запрос или сбросить фильтр сортировки."
                        actionLabel={searchTerm ? 'Сбросить поиск' : undefined}
                        onAction={searchTerm ? () => { setSearchTerm(''); fetchCompanies(1, '', sortBy); } : undefined}
                    />
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <p className="text-sm text-slate-400">
                                Показаны {visibleFrom}–{visibleTo} из {total}. Страница {page} из {totalPages}.
                            </p>
                            {loading && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-md text-violet-300 text-xs font-medium animate-pulse">
                                    Загрузка...
                                </span>
                            )}
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
                            <AnimatePresence mode="popLayout">
                                {companies.map((company) => (
                                    <motion.div
                                        key={company.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <CompanyCard
                                            company={company}
                                            onOpenProfile={() => navigate(`/companies/${company.id}`)}
                                            onViewJobs={() => navigate(`/jobs?company=${encodeURIComponent(company.name)}`)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            isLoading={loading}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
