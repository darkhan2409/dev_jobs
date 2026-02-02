import React, { useState, useEffect } from 'react';
import { Building2, Briefcase } from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const CompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                setError('Не удалось загрузить список компаний');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    const handleViewJobs = (companyName) => {
        navigate(`/jobs?company=${encodeURIComponent(companyName)}`);
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] p-4 md:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="h-10 w-64 bg-slate-800 rounded-lg animate-pulse mb-2"></div>
                        <div className="h-6 w-96 bg-slate-800/50 rounded-lg animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 animate-pulse">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 bg-slate-800 rounded-xl"></div>
                                    <div className="flex-1">
                                        <div className="h-6 bg-slate-800 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-800/50 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="h-10 bg-slate-800 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <ErrorState
                    title="Failed to load companies"
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 p-12 rounded-3xl border border-slate-800 backdrop-blur-xl max-w-lg w-full"
                >
                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-violet-400">
                        <Building2 size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Компании не найдены</h1>
                    <p className="text-slate-400">
                        В данный момент нет активных компаний с вакансиями.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Building2 className="text-violet-500" size={36} />
                        Компании
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Найдено {companies.length} {companies.length === 1 ? 'компания' : 'компаний'} с активными вакансиями
                    </p>
                </motion.div>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {companies.map((company, index) => (
                            <motion.div
                                key={company.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 group hover:shadow-xl hover:shadow-violet-500/10"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    {/* Company Logo */}
                                    {company.logo_url ? (
                                        <img
                                            src={company.logo_url}
                                            alt={company.name}
                                            loading="lazy"
                                            className="w-16 h-16 rounded-xl object-cover bg-slate-800 border border-slate-700"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center ${company.logo_url ? 'hidden' : 'flex'}`}
                                    >
                                        <Building2 className="text-violet-400" size={28} />
                                    </div>

                                    {/* Company Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-violet-200 transition-colors">
                                            {company.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                                            <Briefcase size={14} />
                                            <span>
                                                {company.vacancy_count} {company.vacancy_count === 1 ? 'вакансия' : company.vacancy_count < 5 ? 'вакансии' : 'вакансий'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* View Jobs Button */}
                                <button
                                    onClick={() => handleViewJobs(company.name)}
                                    className="w-full py-2.5 px-4 bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-violet-500/20"
                                >
                                    <Briefcase size={16} />
                                    Смотреть вакансии
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CompaniesPage;
