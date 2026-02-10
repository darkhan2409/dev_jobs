import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GUIDE_STAGES } from '../../data/guideData';
import { cn } from '../../utils/cn';
import * as LucideIcons from 'lucide-react';

export default function MiniPipelineBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем активный этап из URL
  const pathParts = location.pathname.split('/');
  const currentStageId = pathParts[2] && !['role', 'artifact'].includes(pathParts[2])
    ? pathParts[2]
    : null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-[#0f172a]/95 backdrop-blur-xl',
        'border-t border-slate-800/50',
        'px-4 py-3'
      )}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        {GUIDE_STAGES.map((stage) => {
          const isActive = currentStageId === stage.id;
          const Icon = LucideIcons[stage.icon];

          return (
            <motion.button
              key={stage.id}
              onClick={() => navigate(`/guide/${stage.id}`)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1 group relative"
              aria-label={stage.name}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isActive
                    ? 'bg-violet-500/20 border border-violet-500/50 shadow-lg shadow-violet-500/10'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                )}
              >
                {Icon && (
                  <Icon
                    size={18}
                    className={cn(
                      'transition-colors duration-300',
                      isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-300',
                  isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'
                )}
              >
                {stage.order}
              </span>
              {isActive && (
                <motion.div
                  layoutId="minibar-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-violet-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
