import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

const Input = React.forwardRef(({ className, icon: Icon, error, ...props }, ref) => {
    return (
        <div className="relative w-full">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Icon size={18} />
                </div>
            )}
            <input
                ref={ref}
                className={twMerge(
                    clsx(
                        'w-full bg-surface border rounded-lg py-2.5 text-sm text-text-main placeholder-text-muted transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        Icon ? 'pl-10 pr-4' : 'px-4',
                        error
                            ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                            : 'border-border hover:border-gray-600',
                        className
                    )
                )}
                {...props}
            />
            {error && (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
