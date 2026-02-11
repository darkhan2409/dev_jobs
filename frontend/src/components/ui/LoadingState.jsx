import React from 'react';

const LoadingState = ({
    title = 'Загрузка данных',
    message = 'Подождите, пожалуйста...',
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-center py-16 ${className}`}>
            <div className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 text-center">
                <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mx-auto" />
                <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{message}</p>
            </div>
        </div>
    );
};

export default LoadingState;
