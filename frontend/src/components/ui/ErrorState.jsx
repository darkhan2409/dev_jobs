import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOff, RefreshCw, Home } from 'lucide-react';

const ErrorState = ({
    title = 'Временные неполадки',
    message = 'Не удалось связаться с сервером. Проверьте интернет или попробуйте позже.',
    onRetry,
    retryLabel = 'Повторить',
    showHomeLink = true,
    homeLabel = 'На главную',
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {/* Neutral Icon */}
            <CloudOff className="w-20 h-20 text-gray-600" />

            {/* Title & Description */}
            <h2 className="mt-6 text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-gray-400 max-w-md text-center leading-relaxed">
                {message}
            </p>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-pink-500 hover:shadow-violet-500/30 active:scale-95"
                    >
                        <RefreshCw size={18} />
                        {retryLabel}
                    </button>
                )}
                {showHomeLink && (
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-transparent px-6 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                        <Home size={18} />
                        {homeLabel}
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ErrorState;
