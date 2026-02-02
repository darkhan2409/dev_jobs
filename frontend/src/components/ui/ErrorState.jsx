import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

const ErrorState = ({
    title = "Something went wrong",
    message = "An unexpected error occurred. Please try again.",
    onRetry,
    showHomeLink = true,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <AlertCircle className="text-red-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-slate-400 mb-8 max-w-md">{message}</p>
            <div className="flex items-center gap-4">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors"
                    >
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                )}
                {showHomeLink && (
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors"
                    >
                        <Home size={16} />
                        Back to Home
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ErrorState;
