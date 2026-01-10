import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MapPin, Building2, Calendar, Terminal } from 'lucide-react';

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

const VacancyCard = ({ vacancy }) => {
    // Use key_skills from backend instead of parsing title
    const tags = vacancy.key_skills || [];
    const hasSalary = (vacancy.salary_from && vacancy.salary_from > 0) || (vacancy.salary_to && vacancy.salary_to > 0);
    const location = vacancy.location || 'Remote';
    const postedAt = vacancy.published_at || new Date().toISOString();

    return (
        <div className="group relative bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-600 transition-all duration-200 hover:shadow-2xl hover:shadow-violet-900/10 flex flex-col h-full overflow-hidden">
            {/* Code Editor Line Numbers Decoration */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-950/50 border-r border-slate-800/50 flex flex-col items-center pt-6 text-[10px] font-mono text-slate-700 select-none">
                <span>01</span>
                <span>02</span>
                <span>03</span>
            </div>

            <Link to={`/vacancies/${vacancy.id}`} className="block pl-12 pr-6 py-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {vacancy.company_logo ? (
                                <img
                                    src={vacancy.company_logo}
                                    alt={vacancy.company_name}
                                    className="w-5 h-5 rounded object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <Building2 size={16} className="text-slate-500" />
                            )}
                            <span className="font-mono text-xs text-violet-400">
                                {vacancy.company_name || 'Incognito_Mode'}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-100 font-sans group-hover:text-violet-400 transition-colors mb-3">
                            {vacancy.title}
                        </h3>

                        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm font-mono text-slate-400 mb-4">
                            {hasSalary && (
                                <div className="text-emerald-400 flex items-center gap-1.5">
                                    <span>$</span>
                                    {formatCurrency(vacancy.salary_from, vacancy.salary_to, vacancy.currency)}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-500" />
                                {location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-500" />
                                {formatDate(postedAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack Icons */}
                <div className="flex flex-wrap items-center gap-3 mt-auto">
                    {vacancy.grade && (
                        <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                            {vacancy.grade}
                        </span>
                    )}

                    {tags.slice(0, 5).map((tech, index) => {
                        const iconClass = getIconClass(tech);

                        // Only render if we have an icon mapping
                        if (iconClass) {
                            return (
                                <i
                                    key={index}
                                    className={`${iconClass} colored text-2xl transition-all hover:scale-110`}
                                    title={tech}
                                ></i>
                            );
                        }
                        return null; // Don't render text badges for unmapped skills
                    }).filter(Boolean)}
                </div>
            </Link>

            {/* Terminal Action Footer */}
            <div className="pl-12 pr-6 pb-4 pt-2 border-t border-slate-800/50 bg-slate-900/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-slate-500">
                    git checkout -b job/{vacancy.id}
                </span>
                <Link to={`/ vacancies / ${vacancy.id} `} className="flex items-center gap-2 text-xs font-mono font-bold text-violet-400 hover:text-violet-300">
                    <span className="text-violet-500">&gt;</span> Apply_Now()
                </Link>
            </div>
        </div>
    );
};

export const VacancySkeleton = () => {
    return (
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/30 animate-pulse space-y-4">
            <div className="flex justify-between">
                <div className="space-y-2 w-2/3">
                    <div className="h-5 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                </div>
                <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
            </div>
            <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-800 rounded-full"></div>
                <div className="h-5 w-20 bg-slate-800 rounded-full"></div>
            </div>
            <div className="pt-3 border-t border-slate-800/50 flex justify-between">
                <div className="h-4 w-24 bg-slate-800 rounded"></div>
                <div className="h-4 w-20 bg-slate-800 rounded"></div>
            </div>
        </div>
    );
};

export default VacancyCard;
