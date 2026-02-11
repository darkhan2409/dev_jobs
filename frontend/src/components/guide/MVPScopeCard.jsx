import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MVPScopeCard({ inScope, outOfScope }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-5 border border-slate-700/50 hover:border-violet-500/30 transition-colors"
        >
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-1">Границы MVP</h3>
                <p className="text-xs text-slate-500">Что входит и что не входит</p>
            </div>

            {/* In Scope */}
            <div className="mb-4">
                <p className="text-xs font-medium text-emerald-400 mb-2">✓ В скоупе</p>
                <ul className="space-y-1.5">
                    {inScope.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Out of Scope */}
            {outOfScope && outOfScope.length > 0 && (
                <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">✗ Вне скоупа</p>
                    <ul className="space-y-1.5">
                        {outOfScope.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-500">
                                <XCircle size={16} className="text-slate-600 mt-0.5 flex-shrink-0" />
                                <span className="line-through">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </motion.div>
    );
}
