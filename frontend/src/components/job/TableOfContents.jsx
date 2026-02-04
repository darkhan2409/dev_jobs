import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlignLeft, CheckCircle2, List, Coffee } from 'lucide-react';

const TableOfContents = ({ sections }) => {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -60% 0px' }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100, // Offset for sticky header
                behavior: 'smooth'
            });
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'responsibilities': return CheckCircle2;
            case 'requirements': return List;
            case 'conditions': return Coffee;
            default: return AlignLeft;
        }
    };

    if (!sections || sections.length === 0) return null;

    return (
        <nav className="hidden lg:block sticky top-24 self-start bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 w-64 mr-8">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Содержание
            </h4>
            <ul className="space-y-1">
                {sections.map((section) => {
                    const Icon = getIcon(section.type);
                    const isActive = activeId === section.id;

                    return (
                        <li key={section.id}>
                            <button
                                onClick={() => scrollToSection(section.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-300 relative overflow-hidden group ${isActive
                                        ? 'text-white bg-violet-500/10'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                    }`}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-toc"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 rounded-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}

                                <Icon size={16} className={`flex-shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                <span className="truncate">{section.title}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default TableOfContents;
