import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VisionStatementCard({ statement }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-5 border border-violet-500/20 hover:border-violet-500/40 transition-colors relative overflow-hidden"
        >
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />

            {/* Quote icon */}
            <Quote size={32} className="text-violet-500/20 mb-3" />

            {/* Statement */}
            <blockquote className="text-base font-medium text-slate-200 leading-relaxed italic">
                "{statement}"
            </blockquote>

            {/* Label */}
            <p className="text-xs text-slate-500 mt-4">Видение продукта</p>
        </motion.div>
    );
}
