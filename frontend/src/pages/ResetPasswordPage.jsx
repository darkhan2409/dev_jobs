import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import PasswordRequirements from '../components/PasswordRequirements';


const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (!token) {
            setError('Отсутствует токен сброса пароля');
            return;
        }

        setIsLoading(true);

        try {
            await authApi.resetPassword(token, newPassword);
            setSuccess(true);
            // Redirect to home after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join('. '));
            } else {
                setError(detail || 'Не удалось сбросить пароль. Токен может быть недействительным или истекшим.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
                <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
                    <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-3">Неверная ссылка</h2>
                    <p className="text-slate-400 mb-6">Ссылка для сброса пароля недействительна или отсутствует.</p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors"
                    >
                        На главную
                    </Link>
                </div>
            </div>
        );
    }

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
                                <Lock className="text-violet-400" size={32} />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Создайте новый пароль</h1>
                            <p className="text-slate-400">Придумайте надежный пароль для вашего аккаунта</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Новый пароль</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {newPassword && (
                                    <div className="space-y-3 pt-3">
                                        <PasswordRequirements password={newPassword} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Повторите пароль</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {confirmPassword && (
                                    <div className={`mt-2 flex items-center gap-1.5 text-xs transition-colors ${newPassword === confirmPassword
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                        }`}>
                                        {newPassword === confirmPassword ? (
                                            <>
                                                <Check size={14} />
                                                <span>Пароли совпадают</span>
                                            </>
                                        ) : (
                                            <>
                                                <X size={14} />
                                                <span>Пароли не совпадают</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Сбросить пароль'
                                )}
                            </button>
                        </form>

                        <Link
                            to="/"
                            className="block text-center mt-6 text-slate-400 hover:text-violet-400 transition-colors"
                        >
                            Назад на главную
                        </Link>
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-green-500/20 rounded-2xl p-8 text-center">
                        <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-4">
                            <CheckCircle className="text-green-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Пароль изменен!</h2>
                        <p className="text-slate-400 mb-6">
                            Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.
                        </p>
                        <p className="text-sm text-slate-500">Перенаправление на главную страницу...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
