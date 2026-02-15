import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { MapPin } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../utils/animations';
import { getVacancyUpdatedAt } from '../../utils/vacancyTrust';

const getGradeVariant = (grade) => {
    if (!grade) return 'default';
    const g = grade.toLowerCase();
    if (g.includes('junior') || g.includes('intern') || g.includes('стажёр')) return 'junior';
    if (g.includes('senior') || g.includes('principal')) return 'senior';
    if (g.includes('lead') || g.includes('team lead')) return 'lead';
    if (g.includes('middle') || g.includes('mid')) return 'middle';
    return 'default';
};

const formatCardUpdatedLabel = (vacancy) => {
    const updatedAt = getVacancyUpdatedAt(vacancy);
    if (!updatedAt) return '—';

    const date = new Date(updatedAt);
    if (Number.isNaN(date.getTime())) return '—';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffInDays = Math.round((today - target) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';

    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long'
    }).format(date).replace(/\.$/, '');
};

const VacancyCard = ({ vacancy }) => {
    const hasSalary = (vacancy.salary_from && vacancy.salary_from > 0) || (vacancy.salary_to && vacancy.salary_to > 0);
    const salaryLabel = hasSalary
        ? formatCurrency(vacancy.salary_from, vacancy.salary_to, vacancy.currency)
        : 'Договорная';
    const salaryClassName = hasSalary ? 'text-emerald-400' : 'text-slate-400';
    const location = vacancy.location || 'Удалённо';
    const updatedAtLabel = formatCardUpdatedLabel(vacancy);

    return (
        <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            initial="rest"
            className="group relative flex flex-col h-full bg-[#1A1B26] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300"
        >
            <Link
                to={`/jobs/${vacancy.id}`}
                state={{ prefetchedVacancy: vacancy }}
                className="flex flex-col h-full relative z-10"
            >
                <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white p-0.5 flex-shrink-0">
                            {vacancy.company_logo ? (
                                <img
                                    src={vacancy.company_logo}
                                    alt={vacancy.company_name}
                                    className="w-full h-full object-contain rounded-full"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="absolute inset-0 w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 bg-white rounded-full"
                                style={{ display: vacancy.company_logo ? 'none' : 'flex' }}
                            >
                                {(vacancy.company_name || '—').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <span className="font-medium text-slate-400 text-sm truncate group-hover:text-slate-200 transition-colors" title={vacancy.company_name}>
                            {vacancy.company_name || 'Не указано'}
                        </span>
                    </div>

                    {vacancy.grade && (
                        <Badge variant={getGradeVariant(vacancy.grade)} className="uppercase tracking-wider font-semibold">
                            {vacancy.grade}
                        </Badge>
                    )}
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                        {vacancy.title}
                    </h3>

                    <div className={`${salaryClassName} font-semibold text-base`}>
                        {salaryLabel}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-auto pt-2 font-mono">
                        <MapPin size={12} />
                        {location}
                    </div>
                </div>

                <div className="px-4 py-2 border-t border-white/5 bg-black/10">
                    <div className="text-[11px] text-slate-500 text-right">{updatedAtLabel}</div>
                </div>
            </Link>
        </motion.div>
    );
};

export const VacancySkeleton = () => {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#1A1B26] animate-pulse flex flex-col h-[250px]">
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10"></div>
                    <div className="w-20 h-4 bg-white/10 rounded"></div>
                </div>
                <div className="w-16 h-5 bg-white/10 rounded-full"></div>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="w-3/4 h-5 bg-white/10 rounded"></div>
                <div className="w-1/2 h-5 bg-white/10 rounded"></div>
                <div className="w-24 h-5 bg-white/10 rounded"></div>
                <div className="w-24 h-4 bg-white/10 rounded mt-auto"></div>
            </div>

            <div className="px-4 py-2 border-t border-white/5">
                <div className="w-14 h-3 bg-white/10 rounded ml-auto"></div>
            </div>
        </div>
    );
};

export default VacancyCard;
