import React from 'react';
import { ChevronRight, Building2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../utils/animations';

const CompanyCard = ({ company, onViewJobs }) => {
    return (
        <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            initial="rest"
            onClick={() => onViewJobs(company.name)}
            className="group relative flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 p-5 bg-[#1A1B26] border border-white/10 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300"
        >
            {/* Left Side: Company Identity */}
            <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                {/* Logo */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white p-2 flex-shrink-0 shadow-lg">
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
                    <div
                        className="absolute inset-0 w-full h-full flex items-center justify-center text-xl font-bold text-slate-600 bg-white rounded-xl"
                        style={{ display: company.logo_url ? 'none' : 'flex' }}
                    >
                        {(company.name || '—').charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Company Name & Meta */}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {company.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>IT-компания</span>
                        {company.site_url && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                <a
                                    href={company.site_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                                >
                                    <ExternalLink size={14} />
                                    Сайт
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Metrics & Action */}
            <div className="flex items-center gap-6 flex-shrink-0">
                {/* Vacancy Count */}
                <div className="flex flex-col items-center sm:items-end">
                    <div className="text-3xl sm:text-4xl font-bold text-emerald-400 leading-none">
                        {company.vacancy_count}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">
                        {company.vacancy_count === 1 ? 'Вакансия' : 'Вакансий'}
                    </div>
                </div>

                {/* Action Icon */}
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                    <ChevronRight className="text-slate-400 group-hover:text-purple-400 transition-colors" size={20} />
                </div>
            </div>

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-transparent transition-all duration-300 rounded-2xl pointer-events-none"></div>
        </motion.div>
    );
};

export const CompanyCardSkeleton = () => {
    return (
        <div className="flex items-center justify-between gap-6 p-5 bg-[#1A1B26] border border-white/10 rounded-2xl animate-pulse">
            <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl bg-white/10"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="w-48 h-5 bg-white/10 rounded"></div>
                    <div className="w-32 h-4 bg-white/10 rounded"></div>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end gap-1">
                    <div className="w-12 h-8 bg-white/10 rounded"></div>
                    <div className="w-16 h-3 bg-white/10 rounded"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10"></div>
            </div>
        </div>
    );
};

export default CompanyCard;
