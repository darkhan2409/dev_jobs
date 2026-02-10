import * as LucideIcons from 'lucide-react';
import { cn } from '../../utils/cn';

export default function StageHeader({ stage }) {
  const Icon = LucideIcons[stage.icon];

  return (
    <div className="flex items-start gap-4 mb-8">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
          'bg-violet-500/10 border border-violet-500/20'
        )}
      >
        {Icon && <Icon size={24} style={{ color: stage.color }} />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
            {String(stage.order).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-500">{stage.nameEn}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{stage.name}</h1>
        <p className="text-sm text-slate-400 mt-1">{stage.subtitle}</p>
      </div>
    </div>
  );
}
