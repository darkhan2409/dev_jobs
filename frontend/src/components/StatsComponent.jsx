import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { springConfig } from '../utils/animations';

const CountUp = ({ end }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [end]);

    return <span>{count}</span>;
}

const StatsComponent = ({ totalVacancies, loading, error }) => {
    // Determine the state: loading, error, or success
    // We can also have a "timeout" state if needed, but error prop should handle it.

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400">
                <Loader2 className="animate-spin h-4 w-4" />
                <span className="text-sm font-mono">Loading data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-800/50 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-mono">Use offline mode</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springConfig}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-mono text-violet-400 mb-6"
        >
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-slate-300">
                <span className="font-bold text-white"><CountUp end={totalVacancies || 0} /></span> open positions
            </span>
        </motion.div>
    );
};

export default StatsComponent;
