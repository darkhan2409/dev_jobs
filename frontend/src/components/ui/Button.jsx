import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/40',
    secondary: 'bg-secondary text-white hover:bg-secondary-hover shadow-lg shadow-secondary/20 hover:shadow-secondary/40',
    outline: 'bg-transparent border border-gray-700 text-gray-300 hover:border-primary hover:text-white hover:bg-primary/10',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    icon: Icon,
    as: Component = 'button',
    ...props
}, ref) => {

    // If it's a motion component, we need to handle it slightly differently
    // For simplicity, we'll wrap content in standard button/a/Link unless 'as' is passed

    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background';

    const mergedClasses = twMerge(
        clsx(baseStyles, variants[variant], sizes[size], className)
    );

    const content = (
        <>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && Icon && <Icon className="mr-2 h-4 w-4" />}
            {children}
        </>
    );

    if (Component === motion.button) {
        return (
            <Component
                ref={ref}
                className={mergedClasses}
                disabled={isLoading || disabled}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...props}
            >
                {content}
            </Component>
        );
    }

    return (
        <Component
            ref={ref}
            className={mergedClasses}
            disabled={isLoading || disabled}
            {...props}
        >
            {content}
        </Component>
    );
});

Button.displayName = 'Button';

export default Button;
