import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Mail } from 'lucide-react';
import { pageVariants, fadeInUp } from '../utils/animations';

const PrivacyPage = () => {
    return (
        <motion.div
            className="min-h-screen pt-24 pb-16"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div variants={fadeInUp} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl mb-6">
                        <Shield className="text-violet-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Политика конфиденциальности</h1>
                    <p className="text-slate-400">Обновлено: январь 2026</p>
                </motion.div>

                {/* Content */}
                <motion.div variants={fadeInUp} className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Eye className="text-violet-400" size={20} />
                            Введение
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            DevJobs KZ («мы») уважает вашу приватность и стремится защищать ваши данные.
                            Эта политика объясняет, какие данные мы собираем, как используем и как защищаем
                            информацию при использовании нашей платформы.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="text-blue-400" size={20} />
                            Какие данные мы собираем
                        </h2>
                        <ul className="text-slate-300 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Данные о вакансиях:</strong> мы агрегируем публичные вакансии из источников вроде HH.ru.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Анонимная аналитика:</strong> обезличенная статистика использования для улучшения сервиса.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Контактные данные:</strong> только если вы добровольно пишете нам на почту.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Data Usage */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Как мы используем данные</h2>
                        <ul className="text-slate-300 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>Чтобы показывать релевантные вакансии</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>Чтобы улучшать поиск и фильтры</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>Чтобы отвечать на ваши вопросы</span>
                            </li>
                        </ul>
                    </section>

                    {/* Security */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="text-green-400" size={20} />
                            Безопасность
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            Мы используем стандартные меры безопасности для защиты системы.
                            Однако ни один способ передачи данных в интернете не даёт 100% гарантии.
                            Мы делаем всё разумно возможное, чтобы защищать информацию.
                        </p>
                    </section>

                    {/* Third Party */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Сторонние сервисы</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Когда вы нажимаете «Откликнуться», вы переходите на оригинальную страницу вакансии
                            (например, на HH.ru). Мы не отвечаем за политику конфиденциальности сторонних сайтов —
                            рекомендуем ознакомиться с их правилами.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Mail className="text-violet-400" size={20} />
                            Связаться с нами
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            Если у вас есть вопросы по этой политике, напишите нам:
                        </p>
                        <a
                            href="mailto:hello@devjobs.kz"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <Mail size={16} />
                            hello@devjobs.kz
                        </a>
                    </section>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PrivacyPage;
