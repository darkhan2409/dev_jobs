import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OutcomeChecklist({ items, nextStageId, nextStageName }) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/30 rounded-2xl p-8 border border-slate-700/50 max-w-2xl mx-auto"
        >
            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-8">
                Итог: С чем мы идем дальше?
            </h3>

            {/* Checklist */}
            <ul className="space-y-4 mb-8">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <CheckCircle2 size={28} className="text-emerald-500 flex-shrink-0 mt-1" />
                        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                            {item}
                        </p>
                    </li>
                ))}
            </ul>

            {/* Next Step Button */}
            {nextStageId && nextStageName && (
                <div className="text-center">
                    <button
                        onClick={() => navigate(`/guide/${nextStageId}`)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        Следующий этап: {nextStageName}
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
