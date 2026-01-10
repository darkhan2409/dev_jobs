import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VacancyCard from '../features/vacancies/VacancyCard';
import HeroSection from '../components/HeroSection';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize filters from URL or defaults
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        grade: searchParams.get('grade') || '',
        location: searchParams.get('location') || ''
    });
    const [pagination, setPagination] = useState({
        page: parseInt(searchParams.get('page')) || 1,
        per_page: 21,  // 21 vacancies per page to fill the screen
        total: 0
    });

    useEffect(() => {
        fetchVacancies();
    }, [filters, pagination.page]);

    const fetchVacancies = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                per_page: pagination.per_page,
                ...filters
            };
            const response = await axiosClient.get('/vacancies', { params });
            setVacancies(response.data.items);
            setPagination(prev => ({
                ...prev,
                total: response.data.total
            }));
        } catch (error) {
            console.error("Failed to fetch vacancies:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchApply = ({ search, location }) => {
        const newFilters = { ...filters, search, location };
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        updateURL({ ...newFilters, page: 1 });
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
        updateURL({ ...newFilters, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateURL({ ...filters, page: newPage });
    };

    const updateURL = (params) => {
        const newParams = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== '') {
                newParams[key] = value;
            }
        });
        setSearchParams(newParams);
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <HeroSection
                search={filters.search}
                location={filters.location}
                onSearchApply={handleSearchApply}
                filters={filters}
                onFilterChange={handleFilterChange}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Stats / Results Count */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-violet-500">const</span> vacancies =
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-sm font-mono text-slate-300">
                            {pagination.total}
                        </span>
                    </h2>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
                        <div className="font-mono text-sm">Loading modules...</div>
                    </div>
                ) : vacancies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vacancies.map(v => <VacancyCard key={v.id} vacancy={v} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                        <div className="text-slate-500 mb-2 font-mono text-lg">404: Vacancies Not Found</div>
                        <p className="text-sm text-slate-600">Try adjusting your grep query.</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && vacancies.length > 0 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono text-sm"
                        >
                            &lt; Prev
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                            {(() => {
                                const totalPages = Math.ceil(pagination.total / pagination.per_page);
                                const currentPage = pagination.page;
                                const maxVisible = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                // Adjust if we're near the end
                                if (endPage - startPage < maxVisible - 1) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                const pages = [];

                                // First page + ellipsis
                                if (startPage > 1) {
                                    pages.push(
                                        <button
                                            key={1}
                                            onClick={() => handlePageChange(1)}
                                            className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all font-mono text-sm"
                                        >
                                            1
                                        </button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(<span key="ellipsis-start" className="text-slate-600 px-2">...</span>);
                                    }
                                }

                                // Visible page numbers
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`w-10 h-10 rounded-lg transition-all font-mono text-sm ${currentPage === i
                                                ? 'bg-violet-600 border border-violet-500 text-white'
                                                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                                                }`}
                                        >
                                            {i}
                                        </button>
                                    );
                                }

                                // Ellipsis + last page
                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(<span key="ellipsis-end" className="text-slate-600 px-2">...</span>);
                                    }
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => handlePageChange(totalPages)}
                                            className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all font-mono text-sm"
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}
                        </div>

                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.per_page)}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono text-sm"
                        >
                            Next &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HomePage;
