import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ArtifactCard({ artifact }) {
  const navigate = useNavigate();
  const Icon = LucideIcons[artifact.icon];

  return (
    <motion.button
      onClick={() => navigate(`/guide/artifact/${artifact.id}`)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex flex-col items-center gap-2.5 p-4 rounded-xl cursor-pointer',
        'bg-slate-800/30 border border-slate-700/30',
        'hover:border-violet-500/30 hover:bg-slate-800/60',
        'transition-colors duration-200 group'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
        {Icon && <Icon size={20} className="text-violet-400 group-hover:text-violet-300 transition-colors" />}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
          {artifact.nameRu}
        </p>
        <p className="text-[10px] text-slate-600 mt-0.5">{artifact.name}</p>
      </div>
    </motion.button>
  );
}
