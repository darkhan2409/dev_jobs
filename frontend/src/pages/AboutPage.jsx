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
            title: 'AI-Powered Filtering',
            description: 'Intelligent filtering removes irrelevant vacancies using LLM classification.'
        },
        {
            icon: <Code2 className="text-violet-400" size={24} />,
            title: 'Developer-First',
            description: 'Built by developers, for developers. Clean interface, no recruiter noise.'
        },
        {
            icon: <Users className="text-blue-400" size={24} />,
            title: 'Open Source',
            description: 'Fully open source project. Contribute, fork, or learn from the codebase.'
        },
    ];

    const faqs = [
        {
            q: 'How often are vacancies updated?',
            a: 'Vacancies are scraped from HH.ru every few hours to ensure fresh listings.'
        },
        {
            q: 'Is registration required?',
            a: 'No! You can browse all vacancies without creating an account.'
        },
        {
            q: 'How does AI filtering work?',
            a: 'We use LLM to classify vacancies and filter out non-IT roles, ensuring quality listings.'
        },
        {
            q: 'Can I contribute to the project?',
            a: 'Absolutely! Check out our GitHub repository to get started.'
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
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">DevJobs</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        The open-source job board built for the Kazakhstan IT community.
                        No noise, just opportunities.
                    </p>
                </motion.div>

                {/* Mission */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Heart className="text-red-500" size={28} />
                            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed">
                            We believe finding a developer job shouldn't feel like searching for a needle in a haystack.
                            DevJobs aggregates IT vacancies from multiple sources, filters out irrelevant listings using AI,
                            and presents them in a clean, developer-friendly interface. Our goal is to connect talented
                            developers in Kazakhstan with meaningful opportunities.
                        </p>
                    </div>
                </motion.section>

                {/* Features */}
                <motion.section variants={fadeInUp} className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Why DevJobs?</h2>
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
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Tech Stack</h2>
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
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">FAQ</h2>
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
                        <h2 className="text-2xl font-bold text-white mb-4">Get in Touch</h2>
                        <p className="text-slate-300 mb-6">
                            Have questions, suggestions, or want to contribute?
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
