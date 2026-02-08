import React, { useState, useEffect, useMemo } from 'react';
import { Building2, Briefcase, TrendingUp, Search, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { fadeInUp, staggerContainer, cardHoverVariants } from '../utils/animations';

// ... (rest of imports)

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('active'); // 'active', 'name'
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/companies?limit=100');
                setCompanies(response.data.items || []);
                setError(null);
            } catch (err) {
                console.error('Failed to load companies:', err);
                setError('Failed to load companies list');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const filteredCompanies = useMemo(() => {
        let result = [...companies];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(c => c.name.toLowerCase().includes(lowerTerm));
        }

        // Sort
        if (sortBy === 'active') {
            result.sort((a, b) => b.vacancy_count - a.vacancy_count);
        } else if (sortBy === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [companies, searchTerm, sortBy]);

    const stats = useMemo(() => {
        return {
            totalCompanies: companies.length,
            totalVacancies: companies.reduce((acc, curr) => acc + curr.vacancy_count, 0),
            topHiring: companies.filter(c => c.vacancy_count >= 5).length
        };
    }, [companies]);

    const handleViewJobs = (companyName) => {
        navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-surface/50 border border-border rounded-2xl animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-surface/50 border border-border rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Упс, что-то пошло не так</h2>
                    <p className="text-text-muted mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header & Stats */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="mb-12"
                >
                    <motion.div variants={fadeInUp} className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            Лучшие <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">IT‑компании</span>
                        </h1>
                        <p className="text-lg text-text-muted max-w-2xl">
                            Найдите сильные инженерные команды в Казахстане — от быстрорастущих стартапов до крупных компаний.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <motion.div variants={fadeInUp} className="bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl relative overflow-hidden group">
                                    <Building2 className="text-primary-light relative z-10" />
                                    <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-primary/30 transition-all"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Активные компании</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalCompanies}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/10 rounded-xl relative overflow-hidden group">
                                    <Briefcase className="text-secondary relative z-10" />
                                    <p className="text-sm text-text-muted font-medium">Открытые вакансии</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalVacancies}</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="bg-surface/50 backdrop-blur-md border border-border p-6 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl relative overflow-hidden group">
                                    <TrendingUp className="text-emerald-400 relative z-10" />
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-lg group-hover:bg-emerald-500/30 transition-all"></div>
                                </div>
                                <div>
                                    <p className="text-sm text-text-muted font-medium">Нанимают сейчас</p>
                                    <p className="text-2xl font-bold text-white">{stats.topHiring}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="w-full md:w-96">
                            <Input
                                placeholder="Поиск по компаниям…"
                                icon={Search}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-background/50 border-transparent hover:border-border focus:border-primary/50"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 px-2">
                            <Button
                                variant={sortBy === 'active' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('active')}
                            >
                                По активности
                            </Button>
                            <Button
                                variant={sortBy === 'name' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setSortBy('name')}
                            >
                                По алфавиту
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredCompanies.map((company) => (
                            <motion.div
                                key={company.name}
                                layout
                                variants={cardHoverVariants}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover="hover"
                                className="group relative bg-surface border border-border rounded-2xl p-6 cursor-pointer flex flex-col"
                            >
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />

                                <div className="relative z-10 flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-xl bg-background border border-border p-2 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt={company.name}
                                                className="w-full h-full object-contain rounded-lg"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-full h-full flex items-center justify-center ${company.logo_url ? 'hidden' : 'flex'}`}
                                        >
                                            <Building2 className="text-text-muted" size={24} />
                                        </div>
                                    </div>
                                    {company.vacancy_count >= 5 && (
                                        <Badge variant="success" className="shadow-lg shadow-emerald-500/20">
                                            Активно нанимают
                                        </Badge>
                                    )}
                                </div>

                                <div className="relative z-10 flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors truncate">
                                        {company.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-text-muted text-sm mb-6">
                                        <Briefcase size={14} />
                                        <span className="font-medium text-white">{company.vacancy_count}</span>
                                        <span>открытых вакансий</span>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 border-t border-border flex gap-3">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleViewJobs(company.name)}
                                    >
                                        Смотреть вакансии
                                    </Button>
                                    {company.site_url && (
                                        <a
                                            href={company.site_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button variant="outline" className="px-3">
                                                <ExternalLink size={18} />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-block p-4 rounded-full bg-surface border border-border mb-4">
                            <Search className="text-text-muted" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Компании не найдены</h3>
                        <p className="text-text-muted">Попробуйте изменить запрос</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
