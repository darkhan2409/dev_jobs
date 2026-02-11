import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { MapPin, Database, CalendarClock } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../utils/animations';
import { getVacancySourceShortLabel, formatVacancyUpdatedAt } from '../../utils/vacancyTrust';

// Helper function to map skill names to Devicon classes
const getIconClass = (skillName) => {
    const skill = skillName.toLowerCase().trim();

    const iconMap = {
        // Languages
        'python': 'devicon-python-plain',
        'javascript': 'devicon-javascript-plain',
        'js': 'devicon-javascript-plain',
        'typescript': 'devicon-typescript-plain',
        'ts': 'devicon-typescript-plain',
        'java': 'devicon-java-plain',
        'go': 'devicon-go-plain-wordmark',
        'golang': 'devicon-go-plain-wordmark',
        'c#': 'devicon-csharp-plain',
        'csharp': 'devicon-csharp-plain',
        'c++': 'devicon-cplusplus-plain',
        'php': 'devicon-php-plain',
        'ruby': 'devicon-ruby-plain',
        'swift': 'devicon-swift-plain',
        'kotlin': 'devicon-kotlin-plain',
        'rust': 'devicon-rust-original',

        // Frontend
        'react': 'devicon-react-original',
        'reactjs': 'devicon-react-original',
        'vue': 'devicon-vuejs-plain',
        'vue.js': 'devicon-vuejs-plain',
        'vuejs': 'devicon-vuejs-plain',
        'angular': 'devicon-angularjs-plain',
        'svelte': 'devicon-svelte-plain',
        'next.js': 'devicon-nextjs-plain',
        'nextjs': 'devicon-nextjs-plain',
        'html': 'devicon-html5-plain',
        'html5': 'devicon-html5-plain',
        'css': 'devicon-css3-plain',
        'css3': 'devicon-css3-plain',
        'sass': 'devicon-sass-original',
        'tailwind': 'devicon-tailwindcss-original',
        'tailwindcss': 'devicon-tailwindcss-original',
        'bootstrap': 'devicon-bootstrap-plain',

        // Backend/Frameworks
        'node': 'devicon-nodejs-plain',
        'nodejs': 'devicon-nodejs-plain',
        'node.js': 'devicon-nodejs-plain',
        'express': 'devicon-express-original',
        'expressjs': 'devicon-express-original',
        'django': 'devicon-django-plain',
        'flask': 'devicon-flask-original',
        'fastapi': 'devicon-fastapi-plain',
        'spring': 'devicon-spring-original',
        'laravel': 'devicon-laravel-original',

        // Databases
        'postgresql': 'devicon-postgresql-plain',
        'postgres': 'devicon-postgresql-plain',
        'mysql': 'devicon-mysql-plain',
        'mongodb': 'devicon-mongodb-plain',
        'mongo': 'devicon-mongodb-plain',
        'redis': 'devicon-redis-plain',
        'sqlite': 'devicon-sqlite-plain',
        'oracle': 'devicon-oracle-original',

        // DevOps/Tools
        'docker': 'devicon-docker-plain',
        'kubernetes': 'devicon-kubernetes-plain',
        'k8s': 'devicon-kubernetes-plain',
        'git': 'devicon-git-plain',
        'github': 'devicon-github-original',
        'gitlab': 'devicon-gitlab-plain',
        'jenkins': 'devicon-jenkins-plain',
        'linux': 'devicon-linux-plain',
        'ubuntu': 'devicon-ubuntu-plain',
        'nginx': 'devicon-nginx-original',
        'aws': 'devicon-amazonwebservices-plain-wordmark',
        'azure': 'devicon-azure-plain',
        'gcp': 'devicon-googlecloud-plain',
        'terraform': 'devicon-terraform-plain',
        'ansible': 'devicon-ansible-plain',
    };

    return iconMap[skill] || null;
};

const getGradeVariant = (grade) => {
    if (!grade) return 'default';
    const g = grade.toLowerCase();
    if (g.includes('junior') || g.includes('intern') || g.includes('СЃС‚Р°Р¶С‘СЂ')) return 'junior';
    if (g.includes('senior') || g.includes('principal')) return 'senior';
    if (g.includes('lead') || g.includes('team lead')) return 'lead';
    if (g.includes('middle') || g.includes('mid')) return 'middle';
    return 'default';
};

const VacancyCard = ({ vacancy }) => {
    const tags = vacancy.key_skills || [];
    const hasSalary = (vacancy.salary_from && vacancy.salary_from > 0) || (vacancy.salary_to && vacancy.salary_to > 0);
    const location = vacancy.location || 'Удалённо';
    const sourceShortLabel = getVacancySourceShortLabel(vacancy);
    const updatedAtShort = formatVacancyUpdatedAt(vacancy, { short: true });

    return (
        <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            initial="rest"
            className="group relative flex flex-col h-full bg-[#1A1B26] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-300"
        >
            <Link to={`/jobs/${vacancy.id}`} className="flex flex-col h-full relative z-10">

                {/* 1. Header Section */}
                <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-white/5">
                    {/* Left: Company */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-white p-0.5 flex-shrink-0">
                            {vacancy.company_logo ? (
                                <img
                                    src={vacancy.company_logo}
                                    alt={vacancy.company_name}
                                    className="w-full h-full object-contain rounded-full"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                            ) : null}
                            <div
                                className="absolute inset-0 w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 bg-white rounded-full"
                                style={{ display: vacancy.company_logo ? 'none' : 'flex' }}
                            >
                                {(vacancy.company_name || 'вЂ”').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <span className="font-medium text-slate-400 text-sm truncate group-hover:text-slate-200 transition-colors" title={vacancy.company_name}>
                            {vacancy.company_name || 'РќРµ СѓРєР°Р·Р°РЅРѕ'}
                        </span>
                    </div>

                    {/* Right: Grade Badge (color-coded) */}
                    {vacancy.grade && (
                        <Badge variant={getGradeVariant(vacancy.grade)} className="uppercase tracking-wider font-semibold">
                            {vacancy.grade}
                        </Badge>
                    )}
                </div>

                {/* 2. Body Section */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                        {vacancy.title}
                    </h3>

                    {hasSalary && (
                        <div className="text-emerald-400 font-semibold text-base">
                            {formatCurrency(vacancy.salary_from, vacancy.salary_to, vacancy.currency)}
                        </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-auto pt-2 font-mono">
                        <MapPin size={12} />
                        {location}
                    </div>
                </div>

                <div className="px-4 py-2 border-t border-white/5 bg-black/10">
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                            <Database size={12} />
                            {sourceShortLabel}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <CalendarClock size={12} />
                            Обновлено {updatedAtShort}
                        </span>
                    </div>
                </div>

                {/* 3. Footer Section (Tech Stack Pills) */}
                {tags.length > 0 && (
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {tags.slice(0, 4).map((tech, index) => {
                                const iconClass = getIconClass(tech);
                                return (
                                    <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400 group-hover:bg-white/10 transition-colors" title={tech}>
                                        {iconClass && <i className={`${iconClass} colored text-sm`}></i>}
                                        {tech}
                                    </span>
                                );
                            })}
                            {tags.length > 4 && (
                                <span className="text-xs text-slate-500 font-mono">+{tags.length - 4}</span>
                            )}
                        </div>
                    </div>
                )}
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

            <div className="p-4 flex-1">
                <div className="w-3/4 h-5 bg-white/10 rounded mb-2"></div>
                <div className="w-1/2 h-5 bg-white/10 rounded mb-4"></div>
                <div className="w-24 h-4 bg-white/10 rounded mt-auto"></div>
            </div>

            <div className="px-4 py-3 border-t border-white/5 flex gap-1.5">
                <div className="w-16 h-5 bg-white/10 rounded-md"></div>
                <div className="w-14 h-5 bg-white/10 rounded-md"></div>
                <div className="w-12 h-5 bg-white/10 rounded-md"></div>
            </div>
        </div>
    );
};

export default VacancyCard;


