import React from 'react';
import { Link } from 'react-router-dom';
import {
    PROJECT_AUTHOR_LINKEDIN_URL,
    PROJECT_GITHUB_REPO_URL
} from '../constants/trustSignals';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const platformLinks = [
    { to: '/jobs', label: 'Вакансии' },
    { to: '/guide', label: 'Карта профессий' },
    { to: '/career', label: 'Карьерный тест' },
    { to: '/companies', label: 'Компании' },
];

const projectLinks = [
    { to: '/about', label: 'О нас', type: 'internal' },
    { to: '/post-job', label: 'Работодателям', type: 'internal' },
    { to: PROJECT_GITHUB_REPO_URL, label: 'GitHub', type: 'external' },
    { to: '/privacy', label: 'Политика конфиденциальности', type: 'internal' },
];

const AppFooter = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 mt-auto pt-9 pb-5">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                    {/* 1. Brand & Vision */}
                    <div className="space-y-4">
                        <div className="inline-block text-3xl font-bold font-mono tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            GitJob
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Open Source навигатор твоей карьеры. Честные вакансии, карта профессий и никаких лишних посредников.
                        </p>
                    </div>

                    {/* 2. Site Map */}
                    <div className="flex flex-col">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:justify-items-end">
                            <div className="w-full max-w-[240px]">
                                <h3 className="text-gray-500 uppercase text-xs tracking-wider font-semibold mb-3">
                                    Платформа
                                </h3>
                                <div className="flex flex-col space-y-2">
                                    {platformLinks.map((link) => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            onClick={() =>
                                                trackEvent(ANALYTICS_EVENTS.NAV_CLICK, {
                                                    source: 'footer_platform',
                                                    destination: link.to,
                                                    label: link.label,
                                                })
                                            }
                                            className="text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full max-w-[240px]">
                                <h3 className="text-gray-500 uppercase text-xs tracking-wider font-semibold mb-3">
                                    Проект
                                </h3>
                                <div className="flex flex-col space-y-2">
                                    {projectLinks.map((link) => (
                                        link.type === 'external' ? (
                                            <a
                                                key={link.to}
                                                href={link.to}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={() =>
                                                    trackEvent(ANALYTICS_EVENTS.NAV_CLICK, {
                                                        source: 'footer_project_external',
                                                        destination: link.to,
                                                        label: link.label,
                                                    })
                                                }
                                                className="text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() =>
                                                    trackEvent(ANALYTICS_EVENTS.NAV_CLICK, {
                                                        source: 'footer_project',
                                                        destination: link.to,
                                                        label: link.label,
                                                    })
                                                }
                                                className="text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
                    <div className="text-center sm:text-left">
                        © 2026 GitJob. Open Source Project
                    </div>
                    <div className="text-center sm:text-right">
                        Designed & Built by{' '}
                        <a
                            href={PROJECT_AUTHOR_LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                        >
                            Seilbekov Darkhan
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
