import { cn } from '../../utils/cn';

export default function SkillBadge({ name, level }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
      <span className="text-sm text-slate-300 font-medium min-w-0 truncate">{name}</span>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2.5 h-2.5 rounded-sm transition-colors',
              i < level ? 'bg-violet-400' : 'bg-slate-700/50'
            )}
          />
        ))}
      </div>
    </div>
  );
}
