import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({
    title = 'Ничего не найдено',
    message = 'Попробуйте изменить параметры поиска или вернуться позже.',
    actionLabel,
    onAction,
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-center py-16 ${className}`}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700/70 flex items-center justify-center">
                    <SearchX className="text-slate-400" size={26} />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{message}</p>
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default EmptyState;
