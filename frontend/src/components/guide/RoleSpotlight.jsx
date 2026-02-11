import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getRoleExtras } from '../../data/guideData';

export default function RoleSpotlight({ roleId, quote }) {
    const roleExtras = getRoleExtras(roleId);

    if (!roleExtras) return null;

    const Icon = LucideIcons[roleExtras.icon];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 rounded-2xl p-8 border border-violet-500/30 max-w-2xl mx-auto"
        >
            <div className="flex items-start gap-6">
                {/* Avatar with icon */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                    {Icon && <Icon size={40} className="text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* Role name */}
                    <h3 className="text-xl font-bold text-white mb-1">
                        {roleExtras.simplifiedDescription?.split('.')[0] || 'Специалист'}
                    </h3>

                    {/* Class tagline */}
                    <p className="text-sm text-violet-300 mb-4">
                        {roleExtras.classTagline}
                    </p>

                    {/* Quote */}
                    <blockquote className="text-base text-slate-300 leading-relaxed italic border-l-4 border-violet-500/50 pl-4">
                        "{quote}"
                    </blockquote>
                </div>
            </div>
        </motion.div>
    );
}
