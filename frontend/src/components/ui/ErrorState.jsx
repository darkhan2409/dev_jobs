import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

const ErrorState = ({
    title = 'Что-то пошло не так',
    message = 'Произошла непредвиденная ошибка. Попробуйте ещё раз.',
    onRetry,
    retryLabel = 'Повторить',
    showHomeLink = true,
    homeLabel = 'На главную',
    className = ''
}) => {
    return (
        <div className={`flex items-center justify-center py-16 ${className}`}>
            <div className="w-full max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <AlertCircle className="text-red-300" size={28} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm text-red-100/90">{message}</p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
                        >
                            <RefreshCw size={16} />
                            {retryLabel}
                        </button>
                    )}
                    {showHomeLink && (
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
                        >
                            <Home size={16} />
                            {homeLabel}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorState;
