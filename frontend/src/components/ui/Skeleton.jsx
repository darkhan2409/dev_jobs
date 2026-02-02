import React from 'react';

/**
 * Branded skeleton loader with shimmer effect
 */
const Skeleton = ({ className = '', variant = 'default' }) => {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%]';

    const variants = {
        default: 'rounded-lg',
        circle: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-2xl',
    };

    return (
        <div
            className={`${baseClasses} ${variants[variant]} ${className}`}
            style={{
                animation: 'shimmer 1.5s infinite',
            }}
        />
    );
};

/**
 * Skeleton for vacancy cards
 */
export const VacancyCardSkeleton = () => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 flex-shrink-0" variant="default" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
        </div>
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-20" />
        </div>
    </div>
);

/**
 * Skeleton for metrics cards
 */
export const MetricsCardSkeleton = () => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10" variant="default" />
            <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-20" />
    </div>
);

/**
 * Skeleton for company cards
 */
export const CompanyCardSkeleton = () => (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
            <Skeleton className="w-16 h-16" variant="default" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
    </div>
);

export default Skeleton;
