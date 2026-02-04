import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';
import Input from './ui/Input';
import Button from './ui/Button';

const QUICK_TAGS = ['React', 'Python', 'Go', 'Удалённо', 'Senior'];

const HeroSection = ({ onSearchApply, totalJobs }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearchApply) {
            onSearchApply({ search: searchTerm });
        }
    };
    return (
        <div className="relative overflow-visible border-b border-white/5 pb-20 pt-32">
            <motion.div
                className="relative z-10 max-w-4xl mx-auto px-4 text-center"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.1 }
                    }
                }}
            >
                {/* Badge */}
                <motion.div variants={fadeInUp} className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-mono">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-50"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        {totalJobs ? `${totalJobs.toLocaleString()} IT‑вакансий в Казахстане` : 'Загружаем вакансии...'}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-text-main tracking-tight mb-6 leading-tight">
                    Найдите свой следующий <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">коммит</span>.
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={fadeInUp} className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
                    Платформа для разработчиков — от разработчиков. <br className="hidden sm:block" />
                    Без рекрутеров и шума. Только код.
                </motion.p>

                {/* Search Input */}
                <motion.div variants={fadeInUp} className="max-w-xl mx-auto mb-6 relative z-20">
                    <form onSubmit={handleSubmit} className="relative group flex gap-2">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="например: React‑разработчик, Python…"
                                icon={Search}
                                className="h-12 bg-surface/90 backdrop-blur-xl border-border hover:border-border text-lg"
                            />
                        </div>
                        <div className="relative">
                            <Button
                                type="submit"
                                size="lg"
                                className="h-12 w-12 p-0 rounded-lg shrink-0"
                            >
                                <ArrowRight size={20} />
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Quick Tags */}
                <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 justify-center mb-12">
                    <span className="text-text-muted text-sm self-center">Популярное:</span>
                    {QUICK_TAGS.map((tag) => (
                        <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => onSearchApply({ search: tag })}
                            className="text-xs border-border bg-surface/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary-light"
                        >
                            {tag}
                        </Button>
                    ))}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default HeroSection;
