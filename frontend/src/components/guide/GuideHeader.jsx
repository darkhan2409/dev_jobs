import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function GuideHeader() {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full',
        'bg-[#020617]/80 backdrop-blur-xl',
        'border-b border-slate-800/50'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate('/guide')}
          className="flex items-center gap-2 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-lg font-semibold">GitJob</span>
          <span className="text-xs text-violet-400 font-medium px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            Education
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors hidden sm:block cursor-pointer"
          >
            Вернуться к поиску
          </button>
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'text-slate-400 hover:text-white',
              'hover:bg-slate-800 transition-colors cursor-pointer'
            )}
            aria-label="Закрыть обучение"
          >
            <X size={18} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
