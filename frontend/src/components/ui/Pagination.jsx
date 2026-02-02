import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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

    return (
        <div className="mt-12 flex justify-center items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Previous page"
            >
                &lt;
            </button>

            {pageNumbers.map(pageNum => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-mono text-sm border transition-colors ${
                        currentPage === pageNum
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                >
                    {pageNum}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Next page"
            >
                &gt;
            </button>

            <span className="ml-4 text-slate-500 text-sm font-mono">
                of {totalPages}
            </span>
        </div>
    );
};

export default Pagination;
