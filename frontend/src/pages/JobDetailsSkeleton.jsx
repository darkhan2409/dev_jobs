import React from 'react';

const JobDetailsSkeleton = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans animate-pulse">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-slate-800 rounded"></div>
                        <div className="h-4 w-24 bg-slate-800 rounded"></div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Job Header */}
                <div className="mb-8">
                    <div className="h-10 bg-slate-800 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-5 bg-slate-800 rounded w-48"></div>
                    </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <div className="h-4 bg-slate-800 rounded w-16 mb-2"></div>
                            <div className="h-6 bg-slate-800 rounded w-24"></div>
                        </div>
                    ))}
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 w-16 bg-slate-800 rounded-full"></div>
                    ))}
                </div>

                {/* Description */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 md:p-8 space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-800 rounded w-4/6"></div>
                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
            </main>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl p-4">
                <div className="max-w-4xl mx-auto flex justify-end">
                    <div className="h-12 w-48 bg-slate-800 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsSkeleton;
