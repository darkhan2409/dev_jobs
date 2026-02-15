import React, { useState } from 'react';
import { ArrowRight, Search, CheckCircle2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';
import Input from './ui/Input';
import Button from './ui/Button';


const TECH_FILTERS = ['React', 'Python', 'Go'];

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
                <motion.div variants={fadeInUp} className="text-center max-w-3xl mx-auto px-4 mt-10 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-gray-300">
                            {totalJobs ? `${totalJobs.toLocaleString()} IT вакансий в Казахстане` : 'Загружаем вакансии...'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                        Твой навигатор по <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                            IT-вакансиям
                        </span>
                    </h1>

                    <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        Запутался в профессиях? Мы разложили всё по этапам разработки:{' '}
                        <br className="hidden md:block" />
                        <span className="text-slate-300">от идеи до запуска</span>
                    </p>
                </motion.div>

                {/* Block 1. HERO - Search Input (Simplified button, no accent blur) */}
                <motion.div variants={fadeInUp} className="max-w-xl mx-auto mb-8 relative z-20">
                    <form onSubmit={handleSubmit} className="relative flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Технологии или роль (React, Аналитика)"
                                icon={Search}
                                className="h-14 bg-surface/90 backdrop-blur-xl border-border hover:border-border text-lg"
                            />
                        </div>
                        <div className="relative">
                            <Button
                                type="submit"
                                size="lg"
                                className="h-14 w-14 p-0 rounded-xl shrink-0 bg-surface border border-border hover:border-primary/50 text-text-muted hover:text-primary-light shadow-none"
                            >
                                <ArrowRight size={24} />
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Block 3. Quick filters (Tech only in Hero) */}
                <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 justify-center mb-12">
                    <span className="text-text-muted text-xs uppercase tracking-wider font-semibold self-center mr-2">Популярное:</span>
                    {TECH_FILTERS.map((tag) => (
                        <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => onSearchApply({ search: tag })}
                            className="text-xs border-border bg-surface/50 hover:border-primary/50 hover:bg-primary/5 hover:text-primary-light px-4 py-1.5"
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

