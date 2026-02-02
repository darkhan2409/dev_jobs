import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ghost } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm max-w-md w-full">
                <Ghost size={64} className="text-violet-500 mx-auto mb-6 animate-bounce" />
                <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                <p className="text-slate-400 mb-8">Page not found</p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                    <ArrowLeft size={18} />
                    Go back home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
