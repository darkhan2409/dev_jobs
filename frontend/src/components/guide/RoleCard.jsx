import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn';
import { GUIDE_ROLE_EXTRAS } from '../../data/guideData';

export default function RoleCard({ roleId, whyHere, importance }) {
  const navigate = useNavigate();
  const extras = GUIDE_ROLE_EXTRAS[roleId];

  if (!extras) return null;

  const Icon = LucideIcons[extras.icon];

  return (
    <motion.button
      onClick={() => navigate(`/guide/role/${roleId}`)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full text-left p-4 rounded-xl cursor-pointer',
        'bg-slate-800/40 border border-slate-700/40',
        'hover:border-violet-500/30 hover:bg-slate-800/70',
        'transition-colors duration-200 group'
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
          {Icon && <Icon size={18} className="text-violet-400" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
            {extras.classTagline}
          </p>
          {importance === 'secondary' && (
            <span className="text-[10px] text-slate-600">вторичная роль</span>
          )}
        </div>
      </div>
      {whyHere && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{whyHere}</p>
      )}
    </motion.button>
  );
}
