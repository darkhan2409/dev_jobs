import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Users, Zap, Heart, Mail, Github, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pageVariants, fadeInUp } from '../utils/animations';

const AboutPage = () => {
    const techStack = [
        { name: 'React 19', icon: 'devicon-react-original colored' },
        { name: 'FastAPI', icon: 'devicon-fastapi-plain colored' },
        { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
        { name: 'Tailwind CSS', icon: 'devicon-tailwindcss-original colored' },
        { name: 'Python', icon: 'devicon-python-plain colored' },
        { name: 'Vite', icon: 'devicon-vitejs-plain colored' },
    ];

    const features = [
        {
            icon: <Zap className="text-yellow-400" size={24} />,
            title: 'AI‑фильтрация',
            description: 'Умная фильтрация убирает нерелевантные вакансии с помощью LLM‑классификации.'
        },
        {
            icon: <Code2 className="text-violet-400" size={24} />,
            title: 'Для разработчиков',
            description: 'Сделано разработчиками для разработчиков. Чистый интерфейс без «шума» рекрутеров.'
        },
        {
            icon: <Users className="text-blue-400" size={24} />,
            title: 'Открытый код',
            description: 'Полностью открытый проект. Можно контрибьютить, форкать и учиться по коду.'
        },
    ];

    const faqs = [
        {
            q: 'Как часто обновляются вакансии?',
            a: 'Мы обновляем вакансии с HH.ru каждые несколько часов, чтобы список был свежим.'
        },
        {
            q: 'Нужна регистрация?',
            a: 'Нет. Все вакансии доступны без аккаунта.'
        },
        {
            q: 'Как работает AI‑фильтрация?',
            a: 'Мы классифицируем вакансии и убираем не‑IT роли, чтобы выдача оставалась качественной.'
        },
        {
            q: 'Можно помочь проекту?',
            a: 'Конечно. Загляните в репозиторий на GitHub и подключайтесь.'
        },
    ];

    return (
        <motion.div
            className="min-h-screen pt-24 pb-16"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <motion.div variants={fadeInUp} className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        О <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">DevJobs</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Открытая платформа вакансий для IT‑сообщества Казахстана.
                        Без шума — только возможности.
                    </p>
                </motion.div>

                {/* Mission */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="text-red-500" size={28} />
                            <h2 className="text-2xl font-bold text-white">Наша миссия</h2>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            Мы верим, что поиск работы в IT не должен быть «игрой в иголку в стоге сена».
                            DevJobs агрегирует вакансии из разных источников, убирает нерелевантные роли с помощью AI
                            и показывает всё в чистом, developer‑friendly интерфейсе. Наша цель — соединять сильных
                            разработчиков в Казахстане с действительно интересными возможностями.
                        </p>
                    </div>
                </motion.section>

                {/* Features */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Почему DevJobs?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors"
                            >
                                <div className="bg-slate-800 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Tech Stack */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Технологии</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {techStack.map((tech, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl px-5 py-3 flex items-center gap-3 hover:border-violet-500/50 transition-colors"
                            >
                                <i className={`${tech.icon} text-2xl`}></i>
                                <span className="text-slate-200 font-medium">{tech.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* FAQ */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Вопросы и ответы</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                                <p className="text-slate-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Contact */}
                <motion.section variants={fadeInUp}>
                    <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Связаться с нами</h2>
                        <p className="text-slate-300 mb-6">
                            Есть вопросы, идеи или хотите помочь проекту?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="mailto:hello@devjobs.kz"
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <Mail size={18} />
                                <span>hello@devjobs.kz</span>
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <Github size={18} />
                                <span>GitHub</span>
                            </a>
                            <a
                                href="https://t.me/devjobskz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                            >
                                <MessageCircle size={18} />
                                <span>Telegram</span>
                            </a>
                        </div>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
};

export default AboutPage;
