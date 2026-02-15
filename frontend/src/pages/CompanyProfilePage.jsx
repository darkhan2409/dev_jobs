import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Briefcase, Globe, ExternalLink } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { pageVariants, fadeInUp } from '../utils/animations';
import VacancyCard, { VacancySkeleton } from '../features/vacancies/VacancyCard';
import Pagination from '../components/ui/Pagination';

const formatVacanciesCount = (count) => {
    if (!count) return '0 вакансий';
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} вакансия`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} вакансии`;
    return `${count} вакансий`;
};

const getCompanyDescription = (company) => {
    if (!company) return '';
    return company.description || company.about || company.summary || company.tagline || '';
};

const CompanyProfilePage = () => {
    const { companyId } = useParams();
    const [company, setCompany] = useState(null);
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 21,
        total: 0
    });
    const vacanciesSectionRef = useRef(null);
    const companyDescription = getCompanyDescription(company);

    useEffect(() => {
        const fetchCompanyData = async () => {
            try {
                setLoading(true);
                // Fetch company details
                const response = await axiosClient.get(
                    `/companies/id/${companyId}`,
                    {
                        params: {
                            page: pagination.page,
                            per_page: pagination.per_page
                        }
                    }
                );
                setCompany(response.data.company);
                setVacancies(response.data.vacancies || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.data.total ?? 0
                }));
                setError(null);
            } catch (err) {
                console.error('Failed to fetch company:', err);
                setError('Компания не найдена');
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            fetchCompanyData();
        }
    }, [companyId, pagination.page, pagination.per_page]);

    useEffect(() => {
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, [companyId]);

    useEffect(() => {
        if (company) {
            document.title = `${company.name} | GitJob`;
        }
        return () => {
            document.title = 'GitJob — IT‑вакансии в Казахстане';
        };
    }, [company]);

    // Scroll to vacancies section when page changes
    useEffect(() => {
        if (vacanciesSectionRef.current && pagination.page > 1) {
            const yOffset = -120; // Offset for sticky header
            const element = vacanciesSectionRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [pagination.page]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back button */}
                    <div className="mb-8">
                        <div className="h-6 w-32 bg-slate-800 rounded animate-pulse"></div>
                    </div>

                    {/* Company header skeleton */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 bg-slate-800 rounded-xl animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-8 w-64 bg-slate-800 rounded mb-3 animate-pulse"></div>
                                <div className="h-5 w-48 bg-slate-800/50 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Vacancies skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <VacancySkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !company) {
        return (
            <motion.div
                className="min-h-screen pt-24 pb-16"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Building2 className="text-slate-400" size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Компания не найдена</h1>
                        <p className="text-slate-400 mb-8">
                            Компания не найдена или у неё сейчас нет активных вакансий.
                        </p>
                        <Link
                            to="/companies"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
                        >
                            <ArrowLeft size={18} />
                            К компаниям
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="min-h-screen pt-24 pb-16"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/companies" className="hover:text-white transition-colors">
                            Компании
                        </Link>
                        <span>/</span>
                        <span className="text-slate-300 truncate max-w-[300px]">{company.name}</span>
                    </div>
                </motion.div>

                {/* Company Header */}
                <motion.div
                    variants={fadeInUp}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-xl"
                >
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Logo */}
                        <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center overflow-hidden p-3 flex-shrink-0">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full items-center justify-center ${company.logo_url ? 'hidden' : 'flex'}`}>
                                <Building2 className="text-slate-800" size={40} />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">{company.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-slate-400 mb-4">
                                <div className="flex items-center gap-2">
                                    <Briefcase size={16} />
                                    <span>{formatVacanciesCount(pagination.total)}</span>
                                </div>

                                {/* Company Type */}
                                {company.company_type && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                                            {company.company_type === 'company' ? 'Компания' :
                                             company.company_type === 'agency' ? 'Агентство' :
                                             company.company_type}
                                        </span>
                                    </div>
                                )}

                                {/* Trusted Badge */}
                                {company.trusted && (
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                            Проверенная
                                        </span>
                                    </div>
                                )}

                                {/* Location */}
                                {company.area_name && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>{company.area_name}</span>
                                    </div>
                                )}
                            </div>

                            {company.site_url && (
                                <a
                                    href={company.site_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    <Globe size={16} />
                                    Перейти на сайт
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={fadeInUp}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-xl font-semibold text-white mb-3">О компании</h2>
                    {companyDescription ? (
                        <div
                            className="text-slate-300 leading-relaxed prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: companyDescription }}
                        />
                    ) : (
                        <p className="text-slate-400 leading-relaxed">
                            Подробное описание компании пока недоступно. Мы показываем проверяемый минимум:
                            официальный сайт и список актуальных вакансий.
                        </p>
                    )}

                    {/* Industries */}
                    {company.industries && company.industries.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Отрасли:</h3>
                            <div className="flex flex-wrap gap-2">
                                {company.industries.map((industry, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                                    >
                                        {industry.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-slate-500 mt-4">
                        Данные карточки формируются из активных вакансий и публичных данных работодателя.
                    </p>
                </motion.div>

                {/* Vacancies Section */}
                <motion.div ref={vacanciesSectionRef} variants={fadeInUp}>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Briefcase className="text-violet-400" size={24} />
                        Открытые вакансии
                    </h2>

                    {vacancies.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vacancies.map((vacancy) => (
                                    <VacancyCard key={vacancy.id} vacancy={vacancy} />
                                ))}
                            </div>

                            <Pagination
                                currentPage={pagination.page}
                                totalPages={Math.ceil(pagination.total / pagination.per_page)}
                                onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
                            />
                        </>
                    ) : (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                            <p className="text-slate-400">Сейчас нет активных вакансий.</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default CompanyProfilePage;
