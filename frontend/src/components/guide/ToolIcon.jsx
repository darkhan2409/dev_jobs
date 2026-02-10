export default function ToolIcon({ name }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
      <div className="w-2 h-2 rounded-full bg-violet-400/60" />
      <span className="text-xs text-slate-400 font-medium">{name}</span>
    </div>
  );
}
