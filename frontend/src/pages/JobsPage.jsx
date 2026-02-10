import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FilterSidebar from '../components/FilterSidebar';
import VacancyCard, { VacancySkeleton } from '../features/vacancies/VacancyCard';
import EmptyState from '../components/EmptyState';
import { vacanciesApi } from '../api/vacanciesApi';
import { Menu } from 'lucide-react';
import { fadeInUp, pageVariants } from '../utils/animations';
import Pagination from '../components/ui/Pagination';

const JobsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 21,
        total: 0
    });
    const [pendingPage, setPendingPage] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const gridRef = React.useRef(null);

    // Read filters from URL
    const filters = React.useMemo(() => ({
        search: searchParams.get('search') || '',
        grade: searchParams.get('grade') || '',
        location: searchParams.get('location') || '',
        stack: searchParams.get('stack') || '',
        company: searchParams.get('company') || '',
        sort: searchParams.get('sort') || 'newest',
        minSalary: searchParams.get('minSalary') || '',
        page: parseInt(searchParams.get('page')) || 1
    }), [searchParams]);

    const fetchVacancies = React.useCallback(async (currentFilters) => {
        setLoading(true);
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

            const response = await vacanciesApi.getAll(params);
            setVacancies(response.data.items);
            setPagination({
                page: response.data.page,
                per_page: response.data.per_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Failed to fetch vacancies:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVacancies(filters);
    }, [filters, fetchVacancies]);

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
        setSearchParams(new URLSearchParams());
    };

    const handleFilterChange = (newFilters) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value) {
                newParams.set(key, value);
            } else {
                newParams.delete(key);
            }
        });
        newParams.set('page', '1'); // Reset pagination
        setSearchParams(newParams);
    };

    return (
        <motion.div
            className="min-h-screen pt-24 pb-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="w-full flex items-center justify-center gap-2 bg-[#1A1B26] border border-white/10 p-3 rounded-xl text-white font-medium hover:border-purple-500/50 transition-colors"
                        >
                            <Menu size={20} />
                            {isMobileMenuOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
                        </button>
                    </div>

                    {/* Filter Sidebar (Sticky on Desktop) */}
                    <div className={`lg:block ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                        <div className="sticky top-24">
                            <FilterSidebar
                                filters={filters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Main Content (Grid) */}
                    <main className="flex-1" ref={gridRef}>
                        {/* Header */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Каталог вакансий
                                </h1>
                                <p className="text-slate-400">
                                    Найдено <span className="text-purple-400 font-mono font-bold">{pagination.total}</span> вакансий
                                </p>
                                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                    Страница {pagination.page} из {totalPages}
                                    {pendingPage && (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-md text-violet-300 text-xs font-medium animate-pulse">
                                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Переход на страницу {pendingPage}
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-gray-500 text-sm">Сортировка:</span>
                                <select
                                    value={filters.sort || 'newest'}
                                    onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                                    className="bg-[#0B0C10] border border-gray-800 text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer transition-colors"
                                >
                                    <option value="newest">Сначала новые</option>
                                    <option value="oldest">Сначала старые</option>
                                    <option value="salary_desc">Зарплата: по убыванию</option>
                                    <option value="salary_asc">Зарплата: по возрастанию</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i}><VacancySkeleton /></div>
                                ))}
                            </div>
                        ) : vacancies.length > 0 ? (
                            <>
                                <motion.div
                                    key={pagination.page}
                                    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-400 ${pendingPage ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: { transition: { staggerChildren: 0.05 } }
                                    }}
                                >
                                    {vacancies.map(vacancy => (
                                        <motion.div key={vacancy.id} variants={fadeInUp}>
                                            <VacancyCard vacancy={vacancy} />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Pagination */}
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={totalPages}
                                    isLoading={loading}
                                    pendingPage={pendingPage}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <div className="mt-12">
                                <EmptyState onClear={handleClearFilters} />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </motion.div>
    );
};

export default JobsPage;
