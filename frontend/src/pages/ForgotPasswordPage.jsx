import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || 'Не удалось отправить письмо');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {!success ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex p-4 bg-violet-500/10 rounded-full mb-4">
                                <Mail className="text-violet-400" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Забыли пароль?</h1>
                            <p className="text-slate-400">Введите ваш email, и мы отправим инструкции по сбросу пароля</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Отправка...
                                    </>
                                ) : (
                                    'Отправить инструкции'
                                )}
                            </button>
                        </form>

                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 mt-6 text-slate-400 hover:text-violet-400 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Назад на главную
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-green-500/20 rounded-2xl p-8 text-center">
                        <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-4">
                            <CheckCircle className="text-green-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Проверьте почту</h2>
                        <p className="text-slate-400 mb-6">
                            Если аккаунт с email <span className="text-white font-medium">{email}</span> существует,
                            мы отправили инструкции по сбросу пароля.
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            Письмо должно прийти в течение нескольких минут. Проверьте также папку "Спам".
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors"
                        >
                            <ArrowLeft size={16} />
                            На главную
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
