import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider';

    const variants = {
        neutral: 'bg-white/5 text-secondary border border-border-subtle',
        accent: 'bg-accent/10 text-accent border border-accent/20',
        success: 'bg-success/10 text-success border border-success/20',
    };

    return (
        <span className={`${baseStyles} ${variants[variant] || variants.neutral} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
