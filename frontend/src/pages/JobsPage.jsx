import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import FilterSidebar from '../components/FilterSidebar';
import VacancyCard from '../features/vacancies/VacancyCard';
import { vacanciesApi } from '../api/vacanciesApi';
import { pageVariants } from '../utils/animations';
import Pagination from '../components/ui/Pagination';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const JobsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 21,
        total: 0
    });
    const [pendingPage, setPendingPage] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const gridRef = useRef(null);
    const activeRequestIdRef = useRef(0);
    const abortControllerRef = useRef(null);

    const filters = useMemo(() => ({
        search: searchParams.get('search') || '',
        grade: searchParams.get('grade') || '',
        location: searchParams.get('location') || '',
        stack: searchParams.get('stack') || '',
        company: searchParams.get('company') || '',
        sort: searchParams.get('sort') || 'newest',
        minSalary: searchParams.get('minSalary') || '',
        page: parseInt(searchParams.get('page'), 10) || 1
    }), [searchParams]);

    const fetchVacancies = useCallback(async (currentFilters) => {
        const requestId = ++activeRequestIdRef.current;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentFilters.page,
                per_page: 21,
                search: currentFilters.search,
                grade: currentFilters.grade,
                location: currentFilters.location,
                stack: currentFilters.stack,
                company: currentFilters.company,
                sort: currentFilters.sort,
                min_salary: currentFilters.minSalary || undefined
            };

            const response = await vacanciesApi.getAll(params, { signal: controller.signal });
            if (requestId !== activeRequestIdRef.current) return;
            setVacancies(response.data.items || []);
            setPagination({
                page: response.data.page,
                per_page: response.data.per_page,
                total: response.data.total
            });
        } catch (loadError) {
            if (loadError?.code === 'ERR_CANCELED') return;
            if (requestId !== activeRequestIdRef.current) return;
            console.error('Failed to fetch vacancies:', loadError);
            setVacancies([]);
            setPagination((prev) => ({ ...prev, total: 0 }));
            setError('Не удалось загрузить вакансии. Проверьте соединение и попробуйте снова.');
        } finally {
            if (requestId === activeRequestIdRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchVacancies(filters);
    }, [filters, fetchVacancies]);

    useEffect(() => () => {
        abortControllerRef.current?.abort();
    }, []);

    useEffect(() => {
        setPendingPage(null);
    }, [pagination.page]);

    const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.per_page));

    const handlePageChange = (newPage) => {
        if (newPage === pagination.page || newPage < 1 || newPage > totalPages) return;
        setPendingPage(newPage);

        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    const handleClearFilters = () => {
        trackEvent(ANALYTICS_EVENTS.JOBS_FILTER_APPLY, {
            source: 'jobs_page',
            trigger: 'clear_all',
            active_filters_count: 0,
            filters: {},
        });
        setSearchParams(new URLSearchParams());
        setIsMobileMenuOpen(false);
    };

    const handleFilterChange = (newFilters, options = {}) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(newFilters).forEach(([key, value]) => {
            const normalizedValue = typeof value === 'string' ? value.trim() : value;
            if (normalizedValue) {
                newParams.set(key, normalizedValue);
            } else {
                newParams.delete(key);
            }
        });

        newParams.set('page', '1');
        setSearchParams(newParams);

        const normalizedFilters = {
            ...filters,
            ...newFilters,
            page: 1,
        };
        const activeFiltersCount = [
            normalizedFilters.search,
            normalizedFilters.grade,
            normalizedFilters.location,
            normalizedFilters.stack,
            normalizedFilters.minSalary,
            normalizedFilters.company,
        ].filter(Boolean).length;

        trackEvent(ANALYTICS_EVENTS.JOBS_FILTER_APPLY, {
            source: 'jobs_page',
            trigger: options.trigger || 'filter_change',
            active_filters_count: activeFiltersCount,
            filters: {
                search: normalizedFilters.search || null,
                grade: normalizedFilters.grade || null,
                location: normalizedFilters.location || null,
                stack: normalizedFilters.stack || null,
                company: normalizedFilters.company || null,
                minSalary: normalizedFilters.minSalary || null,
                sort: normalizedFilters.sort || 'newest',
            },
        });
    };

    const activeFilterCount = [
        filters.search,
        filters.grade,
        filters.location,
        filters.stack,
        filters.minSalary,
        filters.company
    ].filter(Boolean).length;
    const filterSidebarKey = [
        filters.search,
        filters.company,
        filters.minSalary,
        filters.location,
        filters.grade,
        filters.stack,
    ].join('|');

    const showInitialLoading = loading && vacancies.length === 0 && !error;

    return (
        <motion.div
            className="min-h-screen pt-28 pb-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="w-full flex items-center justify-center gap-2 bg-[#1A1B26] border border-white/10 p-3 rounded-xl text-white font-medium hover:border-purple-500/50 transition-colors"
                        >
                            <Menu size={20} />
                            {isMobileMenuOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                            {activeFilterCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-violet-500/20 border border-violet-500/40 text-xs text-violet-200">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
                        <div className="sticky top-24">
                            <div className="lg:hidden mb-3 flex justify-end">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                                >
                                    <X size={14} /> Закрыть
                                </button>
                            </div>
                            <FilterSidebar
                                key={filterSidebarKey}
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onFiltersApplied={() => setIsMobileMenuOpen(false)}
                            />
                        </div>
                    </div>

                    <main className="flex-1" ref={gridRef}>
                        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Каталог вакансий</h1>
                                <span className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                                    Найдено {pagination.total} вакансий
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">Сортировка:</span>
                                <select
                                    value={filters.sort || 'newest'}
                                    onChange={(e) => handleFilterChange({ sort: e.target.value }, { trigger: 'sort_select' })}
                                    className="bg-[#0B0C10] border border-gray-800 text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors"
                                >
                                    <option value="newest">Сначала новые</option>
                                    <option value="oldest">Сначала старые</option>
                                    <option value="salary_desc">Зарплата: по убыванию</option>
                                    <option value="salary_asc">Зарплата: по возрастанию</option>
                                </select>
                            </div>
                        </div>

                        {showInitialLoading ? (
                            <LoadingState
                                title="Загружаем вакансии"
                                message="Собираем актуальные предложения по выбранным параметрам."
                            />
                        ) : error ? (
                            <ErrorState
                                title="Не удалось загрузить вакансии"
                                message={error}
                                onRetry={() => fetchVacancies(filters)}
                                showHomeLink={false}
                            />
                        ) : vacancies.length > 0 ? (
                            <>
                                <motion.div
                                    key={pagination.page}
                                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-400 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                                    initial={false}
                                >
                                    {vacancies.map((vacancy) => (
                                        <div key={vacancy.id}>
                                            <VacancyCard vacancy={vacancy} />
                                        </div>
                                    ))}
                                </motion.div>

                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={totalPages}
                                    isLoading={loading}
                                    pendingPage={pendingPage}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <EmptyState
                                title="Вакансии не найдены"
                                message="По текущим фильтрам ничего не найдено. Попробуйте изменить параметры поиска."
                                actionLabel="Сбросить фильтры"
                                onAction={handleClearFilters}
                            />
                        )}
                    </main>
                </div>
            </div>
        </motion.div>
    );
};

export default JobsPage;
