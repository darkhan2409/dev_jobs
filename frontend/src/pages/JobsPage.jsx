import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FilterSidebar from '../components/FilterSidebar';
import VacancyCard, { VacancySkeleton } from '../features/vacancies/VacancyCard';
import EmptyState from '../components/EmptyState';
import axiosClient from '../api/axiosClient';
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Read filters from URL
    const filters = {
        search: searchParams.get('search') || '',
        grade: searchParams.get('grade') || '',
        location: searchParams.get('location') || '',
        stack: searchParams.get('stack') || '',
        company: searchParams.get('company') || '',
        sort: searchParams.get('sort') || 'newest',
        minSalary: searchParams.get('minSalary') || '',
        page: parseInt(searchParams.get('page')) || 1
    };

    useEffect(() => {
        fetchVacancies();
        window.scrollTo(0, 0); // Scroll to top on page or filter change
    }, [searchParams]);

    const fetchVacancies = async () => {
        setLoading(true);
        try {
            const params = {
                page: filters.page,
                per_page: 21,
                search: filters.search,
                grade: filters.grade,
                location: filters.location,
                stack: filters.stack,
                company: filters.company,
                sort: filters.sort,
                min_salary: filters.minSalary || undefined
            };

            const response = await axiosClient.get('/vacancies', { params });
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
    };

    const handlePageChange = (newPage) => {
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
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl text-white font-medium"
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
                    <main className="flex-1">
                        {/* Header */}
                        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Каталог вакансий
                                </h1>
                                <p className="text-slate-400">
                                    Найдено <span className="text-violet-400 font-mono font-bold">{pagination.total}</span> вакансий
                                </p>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">Сортировка:</span>
                                <select
                                    value={filters.sort || 'newest'}
                                    onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value })}
                                    className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-500 cursor-pointer"
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
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                                    totalPages={Math.ceil(pagination.total / pagination.per_page)}
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
