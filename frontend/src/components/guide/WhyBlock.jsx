import { HelpCircle } from 'lucide-react';

export default function WhyBlock({ text }) {
  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/40 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle size={16} className="text-violet-400" />
        <span className="text-sm font-semibold text-violet-400">Зачем это нужно?</span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-violet-500/30 pl-4">
        {text}
      </p>
    </div>
  );
}
