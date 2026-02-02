import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const variants = {
    default: 'bg-surface border-border text-text-muted',
    primary: 'bg-primary/10 border-primary/20 text-primary-light',
    success: 'bg-emerald-900/40 border-emerald-500/20 text-emerald-200',
    outline: 'bg-transparent border-gray-700 text-gray-400',
};

const Badge = ({ className, variant = 'default', children, ...props }) => {
    return (
        <span
            className={twMerge(
                clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
                    variants[variant],
                    className
                )
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
