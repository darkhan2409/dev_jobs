import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SkillTagInput = ({ value = [], onChange, placeholder = "Добавьте навык (например, Python, React)…" }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    };

    const addSkill = () => {
        const trimmedInput = inputValue.trim();

        if (!trimmedInput) return;

        // Check for duplicates (case-insensitive check for better UX)
        const isDuplicate = value.some(skill =>
            skill.toLowerCase() === trimmedInput.toLowerCase()
        );

        if (!isDuplicate) {
            // Add new skill
            onChange([...value, trimmedInput]);
            setInputValue(''); // Clear input
        } else {
            // Optional: Visual feedback for duplicate could go here
            setInputValue('');
        }
    };

    const removeSkill = (skillToRemove) => {
        onChange(value.filter(skill => skill !== skillToRemove));
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <button
                    type="button"
                    onClick={addSkill}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[32px]">
                <AnimatePresence mode="popLayout">
                    {value.map((skill) => (
                        <motion.span
                            key={skill}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            layout
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-lg text-sm font-medium group hover:border-violet-500/40 transition-colors"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="p-0.5 hover:bg-violet-500/20 rounded-md transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </motion.span>
                    ))}
                </AnimatePresence>
                {value.length === 0 && (
                    <span className="text-sm text-slate-500 py-1.5 italic">
                        Пока нет навыков. Добавьте технологии — и подбор станет точнее.
                    </span>
                )}
            </div>
        </div>
    );
};

export default SkillTagInput;
