import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, CheckCircle, ArrowRight, Briefcase } from 'lucide-react';
import { pageVariants, fadeInUp } from '../utils/animations';

const PostJobPage = () => {
    const benefits = [
        'Доступ к тысячам IT‑специалистов в Казахстане',
        'Умный подбор релевантных кандидатов',
        'Чистая платформа для разработчиков',
        'Прозрачные тарифы (скоро)',
    ];

    return (
        <motion.div
            className="min-h-screen pt-24 pb-16"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <motion.div variants={fadeInUp} className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Link to="/" className="hover:text-white transition-colors">Главная</Link>
                        <span>/</span>
                        <span className="text-slate-300">Работодателям</span>
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div variants={fadeInUp} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl mb-6">
                        <Building2 className="text-violet-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Работодателям</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Найдите лучших IT‑специалистов в Казахстане через нашу платформу
                    </p>
                </motion.div>

                {/* Current Status */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-3">В разработке</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Сейчас мы делаем кабинет работодателя. Пока DevJobs автоматически агрегирует
                            вакансии с HH.ru. Скоро вы сможете размещать вакансии напрямую на платформе.
                        </p>
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Зачем размещаться на DevJobs?</h2>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <ul className="space-y-4">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                                    <span className="text-slate-300">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                {/* Current Options */}
                <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Доступно сейчас</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Разместить на HH.ru</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Разместите IT‑вакансию на HeadHunter — и она автоматически появится на DevJobs.
                            </p>
                            <a
                                href="https://hh.kz/employer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                Перейти на HH.kz
                                <ArrowRight size={14} />
                            </a>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Премиум‑размещение</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Нужна выделенная позиция? Напишите нам — обсудим варианты.
                            </p>
                            <a
                                href="mailto:employers@devjobs.kz"
                                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                Связаться
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Contact CTA */}
                <motion.section variants={fadeInUp} className="mb-12">
                    <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Получить ранний доступ</h2>
                        <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                            Узнайте первыми, когда запустится кабинет работодателя.
                            Получите ранний доступ к условиям на старте.
                        </p>
                        <a
                            href="mailto:employers@devjobs.kz?subject=Early Access Request"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
                        >
                            <Mail size={18} />
                            Запросить ранний доступ
                        </a>
                    </div>
                </motion.section>

                {/* Navigation Links */}
                <motion.section variants={fadeInUp}>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/jobs"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
                        >
                            <Briefcase size={18} />
                            Вакансии
                        </Link>
                        <Link
                            to="/companies"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
                        >
                            <Building2 size={18} />
                            Компании
                        </Link>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
};

export default PostJobPage;
