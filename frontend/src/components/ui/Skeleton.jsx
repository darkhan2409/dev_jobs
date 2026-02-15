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

export default Skeleton;
