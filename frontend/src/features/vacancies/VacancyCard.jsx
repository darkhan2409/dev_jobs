import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { MapPin } from 'lucide-react';

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

const getGradeColor = (grade) => {
    // Unified Green styling for all grades, but clearer/darker
    // Using emerald-900ish background for "darker" green feel, and emerald-200 text for visibility
    if (!grade) return 'border-slate-800 text-slate-500 bg-slate-900';
    return 'border-emerald-500/20 text-emerald-200 bg-emerald-900/40 shadow-[inset_0_0_8px_rgba(16,185,129,0.1)]';
};

const VacancyCard = ({ vacancy }) => {
    const tags = vacancy.key_skills || [];
    const hasSalary = (vacancy.salary_from && vacancy.salary_from > 0) || (vacancy.salary_to && vacancy.salary_to > 0);
    const location = vacancy.location || 'Remote';
    const gradeColorClass = getGradeColor(vacancy.grade);

    return (
        <div className="group relative flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer divide-y divide-slate-800">
            <Link to={`/jobs/${vacancy.id}`} className="flex flex-col h-full">

                {/* 1. Header Section ("The Cap") */}
                <div className="bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-3">
                    {/* Left: Company */}
                    <div
                        className="flex items-center gap-2 flex-1 min-w-0"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Future: navigate to company
                        }}
                    >
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
                                {(vacancy.company_name || 'I').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <span className="font-medium text-slate-300 text-sm truncate group-hover:text-violet-200 transition-colors" title={vacancy.company_name}>
                            {vacancy.company_name || 'Incognito'}
                        </span>
                    </div>

                    {/* Right: Grade Badge */}
                    {vacancy.grade && (
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border shrink-0 ${gradeColorClass}`}>
                            {vacancy.grade}
                        </span>
                    )}
                </div>

                {/* 2. Body Section (Main Info) */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-violet-100 transition-colors">
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

                {/* 3. Footer Section (Tech Stack) */}
                {tags.length > 0 && (
                    <div className="px-4 py-3 bg-white/[0.02]">
                        <div className="flex items-center gap-2">
                            {tags.slice(0, 4).map((tech, index) => {
                                const iconClass = getIconClass(tech);
                                if (iconClass) {
                                    return (
                                        <i
                                            key={index}
                                            className={`${iconClass} colored text-lg opacity-80 group-hover:opacity-100 transition-opacity`}
                                            title={tech}
                                        ></i>
                                    );
                                }
                                return null;
                            }).filter(Boolean)}
                            {tags.length > 4 && (
                                <span className="text-xs text-slate-500 font-mono">+{tags.length - 4}</span>
                            )}
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
};

export const VacancySkeleton = () => {
    return (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 animate-pulse flex flex-col h-[250px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800"></div>
                    <div className="w-20 h-4 bg-slate-800 rounded"></div>
                </div>
                <div className="w-16 h-5 bg-slate-800 rounded-full"></div>
            </div>

            <div className="w-3/4 h-6 bg-slate-800 rounded mb-2"></div>
            <div className="w-1/2 h-6 bg-slate-800 rounded mb-4"></div>

            <div className="mt-auto flex gap-2 mb-4">
                <div className="w-20 h-4 bg-slate-800 rounded"></div>
            </div>

            <div className="pt-3 mt-auto border-t border-slate-800/50 flex gap-2">
                <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
                <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
                <div className="w-6 h-6 bg-slate-800 rounded-full"></div>
            </div>
        </div>
    );
};

export default VacancyCard;
