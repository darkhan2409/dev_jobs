import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, className, variant = 'default' }) => {
    const variants = {
        default: 'bg-slate-800 text-slate-300',
        python: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        react: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
        javascript: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        typescript: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
        node: 'bg-green-500/10 text-green-400 border-green-500/20',
        go: 'bg-cyan-600/10 text-cyan-500 border-cyan-600/20',
        java: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'c++': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'c#': 'bg-purple-600/10 text-purple-500 border-purple-600/20',
        php: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        ruby: 'bg-red-500/10 text-red-400 border-red-500/20',
        vue: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        angular: 'bg-red-600/10 text-red-500 border-red-600/20',
        devops: 'bg-orange-600/10 text-orange-500 border-orange-600/20',
        backend: 'bg-slate-700/10 text-slate-400 border-slate-700/20',
        frontend: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        fullstack: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    };

    // Enhanced heuristic mapping
    const getVariantClass = (v) => {
        const lower = v.toLowerCase();
        if (lower.includes('python')) return variants.python;
        if (lower.includes('react')) return variants.react;
        if (lower.includes('typescript')) return variants.typescript;
        if (lower.includes('javascript') || lower.includes('js')) return variants.javascript;
        if (lower.includes('node')) return variants.node;
        if (lower.includes('go')) return variants.go;
        if (lower.includes('java')) return variants.java;
        if (lower.includes('c++')) return variants['c++'];
        if (lower.includes('c#')) return variants['c#'];
        if (lower.includes('php')) return variants.php;
        if (lower.includes('ruby')) return variants.ruby;
        if (lower.includes('vue')) return variants.vue;
        if (lower.includes('angular')) return variants.angular;
        if (lower.includes('devops')) return variants.devops;
        if (lower.includes('backend')) return variants.backend;
        if (lower.includes('frontend')) return variants.frontend;
        if (lower.includes('fullstack') || lower.includes('full stack')) return variants.fullstack;
        return variants.default;
    }

    const variantClass = variants[variant] || getVariantClass(children?.toString() || '') || variants.default;

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent", variantClass, className)}>
            {children}
        </span>
    );
};

export default Badge;
