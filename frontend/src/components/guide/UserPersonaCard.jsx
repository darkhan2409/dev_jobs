import { User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserPersonaCard({ name, painPoint, goal }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-5 border border-slate-700/50 hover:border-violet-500/30 transition-colors"
        >
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <User size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">{name}</h3>
                    <p className="text-xs text-slate-500">Целевой пользователь</p>
                </div>
            </div>

            {/* Attributes */}
            <div className="space-y-3">
                <div>
                    <p className="text-xs font-medium text-violet-400 mb-1">💢 Боль</p>
                    <p className="text-sm text-slate-300">{painPoint}</p>
                </div>
                <div>
                    <p className="text-xs font-medium text-emerald-400 mb-1">🎯 Цель</p>
                    <p className="text-sm text-slate-300">{goal}</p>
                </div>
            </div>
        </motion.div>
    );
}
