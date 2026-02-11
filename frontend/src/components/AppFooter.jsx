import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerPrimaryLinks = [
    { to: '/start', label: 'С чего начать' },
    { to: '/career', label: 'Карьерный тест' },
    { to: '/guide', label: 'Карта профессий' },
    { to: '/jobs', label: 'Вакансии', isPrimary: true },
    { to: '/companies', label: 'Компании' },
    { to: '/post-job', label: 'Работодателям' },
];

const AppFooter = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 mt-auto pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {/* 1. Brand & Vision */}
                    <div className="space-y-6">
                        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                            &lt;GitJob /&gt;
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            Открытая доска вакансий для разработчиков — от разработчиков.
                            Мы соединяем таланты и возможности с помощью умного подбора и
                            прозрачной аналитики. Без шума — только код.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                <Github size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-800 transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* 2. Quick Links & Contact */}
                    <div className="flex flex-col md:items-end space-y-6">
                        <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2 text-sm font-medium">
                            {footerPrimaryLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={link.isPrimary
                                        ? 'text-slate-100 hover:text-violet-300 transition-colors'
                                        : 'text-slate-400 hover:text-violet-400 transition-colors'
                                    }
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2 text-sm">
                            <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">Конфиденциальность</Link>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                            <div className="bg-slate-800 p-2 rounded-md text-violet-400">
                                <Mail size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Контакты</span>
                                <a href="mailto:hello@devjobs.kz" className="text-slate-200 hover:text-white text-sm">hello@devjobs.kz</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
                    <div>
                        © {new Date().getFullYear()} GitJob KZ. Открытый код.
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Сделано с</span>
                        <Heart size={12} className="text-red-500 fill-red-500" />
                        <span>в Казахстане</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
