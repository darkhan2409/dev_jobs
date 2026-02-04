import React from 'react';
import { SearchX, XCircle } from 'lucide-react';

const EmptyState = ({ onClear }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
            <div className="bg-slate-800/50 p-4 rounded-full mb-6">
                <SearchX size={48} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
                Вакансии не найдены
            </h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                По текущим фильтрам ничего не нашлось. Попробуйте изменить параметры поиска.
            </p>
            {onClear && (
                <button
                    onClick={onClear}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-medium border border-slate-700"
                >
                    <XCircle size={18} />
                    Сбросить все фильтры
                </button>
            )}
        </div>
    );
};

export default EmptyState;
