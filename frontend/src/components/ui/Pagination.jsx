import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, isLoading = false, pendingPage = null }) => {
    if (totalPages <= 1) return null;

    // Calculate sliding window of page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Adjust start if close to end
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    const handleSafePageChange = (nextPage) => {
        if (isLoading) return;
        if (nextPage < 1 || nextPage > totalPages) return;
        if (nextPage === currentPage) return;
        onPageChange(nextPage);
    };

    return (
        <div className="mt-12 flex justify-center items-center gap-2" aria-busy={isLoading}>
            <button
                onClick={() => handleSafePageChange(currentPage - 1)}
                disabled={isLoading || currentPage === 1}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Предыдущая страница"
            >
                &lt;
            </button>

            {pageNumbers.map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => handleSafePageChange(pageNum)}
                    disabled={isLoading}
                    className={`w-10 h-10 rounded-lg font-mono text-sm border transition-colors cursor-pointer ${
                        currentPage === pageNum
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : pendingPage === pageNum
                                ? 'bg-violet-500/30 border-violet-400 text-violet-100 animate-pulse'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                    {pageNum}
                </button>
            ))}

            <button
                onClick={() => handleSafePageChange(currentPage + 1)}
                disabled={isLoading || currentPage >= totalPages}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Следующая страница"
            >
                &gt;
            </button>

            <span className="ml-4 text-slate-500 text-sm font-mono">
                из {totalPages}
            </span>
            {isLoading && (
                <span className="ml-2 text-xs text-violet-300 font-medium">
                    Загрузка...
                </span>
            )}
        </div>
    );
};

export default Pagination;
