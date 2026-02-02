import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';

const QUICK_TAGS = ['React', 'Python', 'Go', 'Remote', 'Senior'];

const HeroSection = ({ onSearchApply, totalJobs }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearchApply) {
            onSearchApply({ search: searchTerm });
        }
    };
    return (
        <div className="relative overflow-visible border-b border-slate-800/50 pb-20 pt-32">
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                        {totalJobs ? `${totalJobs.toLocaleString()} IT vacancies in Kazakhstan` : 'Loading vacancies...'}
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold text-slate-100 tracking-tight mb-6 leading-tight">
                    Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">commit</span>.
                </motion.h1>

                {/* Subtitle */}
                <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The platform built for developers, by developers. <br className="hidden sm:block" />
                    No recruiters, no noise. Just code.
                </motion.p>

                {/* Search Input */}
                <motion.div variants={fadeInUp} className="max-w-xl mx-auto mb-6 relative z-20">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                        <div className="relative flex items-center bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-xl p-2 shadow-2xl ring-1 ring-white/10">
                            <Search className="ml-4 text-slate-500" size={20} />
                            <input
                                type="text"
                                name="search"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g. React Developer, Python..."
                                className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none outline-none px-4 py-3 text-lg focus:bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0f172a_inset] [&:-webkit-autofill]:bg-[#0f172a] [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[50000s] [&:-webkit-autofill]:text-slate-200"
                            />
                            <button
                                type="submit"
                                className="bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-lg transition-colors"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Quick Tags */}
                <motion.div variants={fadeInUp} className="flex flex-wrap gap-2 justify-center mb-12">
                    <span className="text-slate-500 text-sm">Popular:</span>
                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onSearchApply({ search: tag })}
                            className="px-3 py-1 text-sm bg-slate-800/50 hover:bg-violet-500/20 border border-slate-700 hover:border-violet-500/50 text-slate-300 hover:text-violet-200 rounded-lg transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default HeroSection;
