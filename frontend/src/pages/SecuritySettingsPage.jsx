import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Smartphone, Trash2, CheckCircle, AlertCircle, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from '../components/Toast';

const SecuritySettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Change Password Form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Email Verification
    const [verificationCode, setVerificationCode] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Delete Account
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await authApi.getSessions();
            setSessions(response.data);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают');
            return;
        }

        setIsChangingPassword(true);

        try {
            await authApi.changePassword(oldPassword, newPassword);
            setSuccess('Пароль успешно изменен. Вы будете выведены из всех устройств.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Logout after 2 seconds
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(e => e.msg).join('. '));
            } else {
                setError(detail || 'Не удалось изменить пароль');
            }
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSendVerificationEmail = async () => {
        setError('');
        setSuccess('');
        setIsSendingCode(true);

        try {
            await authApi.sendVerificationEmail();
            setSuccess('Код подтверждения отправлен на вашу почту');
        } catch (err) {
            setError(err.response?.data?.detail || 'Не удалось отправить код');
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsVerifying(true);

        try {
            await authApi.verifyEmail(verificationCode);
            setSuccess('Email успешно подтвержден!');
            setVerificationCode('');
            // Refresh user data
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.detail || 'Неверный или истекший код');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await authApi.revokeSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            setSuccess('Сессия завершена');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Не удалось завершить сессию');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setError('');
        setIsDeleting(true);

        try {
            await authApi.deleteAccount(deletePassword);
            // Show toast notification
            addToast('Аккаунт успешно удалён', 'success', 3000);
            // Logout and redirect to home
            setTimeout(() => {
                logout();
                navigate('/');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.detail || 'Не удалось удалить аккаунт');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Безопасность</h1>

                {/* Notifications */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400"
                    >
                        <AlertCircle size={20} />
                        {error}
                    </motion.div>
                )}

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400"
                    >
                        <CheckCircle size={20} />
                        {success}
                    </motion.div>
                )}

                {/* Email Verification */}
                {!user?.email_verified && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                <Mail className="text-amber-400" size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">Подтвердите email</h3>
                                <p className="text-slate-400 mb-4">Ваш email еще не подтвержден. Подтвердите для полного доступа.</p>

                                <form onSubmit={handleVerifyEmail} className="space-y-3">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="Введите код из письма"
                                            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isVerifying || !verificationCode}
                                            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white rounded-lg transition-colors"
                                        >
                                            {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Подтвердить'}
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSendVerificationEmail}
                                        disabled={isSendingCode}
                                        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                    >
                                        {isSendingCode ? 'Отправка...' : 'Отправить код на почту'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Change Password */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-violet-500/10 rounded-lg">
                            <Lock className="text-violet-400" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Изменить пароль</h2>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Текущий пароль"
                            required
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Новый пароль"
                            required
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Повторите новый пароль"
                            required
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium rounded-lg transition-colors"
                        >
                            {isChangingPassword ? <Loader2 className="animate-spin inline" size={20} /> : 'Изменить пароль'}
                        </button>
                    </form>
                </motion.div>

                {/* Active Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Smartphone className="text-blue-400" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Активные сессии</h2>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="animate-spin mx-auto text-violet-400" size={32} />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-slate-400">Нет активных сессий</p>
                    ) : (
                        <div className="space-y-3">
                            {sessions.map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                                    <div>
                                        <p className="text-white font-medium">{session.device_info || 'Unknown Device'}</p>
                                        <p className="text-sm text-slate-400">IP: {session.ip_address}</p>
                                        <p className="text-xs text-slate-500">
                                            Последняя активность: {new Date(session.last_used_at || session.created_at).toLocaleString('ru-RU')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                                    >
                                        Завершить
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Delete Account */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-900 border border-red-500/20 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <Trash2 className="text-red-400" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-white">Удалить аккаунт</h2>
                    </div>

                    <p className="text-slate-400 mb-4">Это действие необратимо. Все ваши данные будут удалены.</p>

                    {!showDeleteConfirm ? (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors"
                        >
                            Удалить аккаунт
                        </button>
                    ) : (
                        <form onSubmit={handleDeleteAccount} className="space-y-3">
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Введите пароль для подтверждения"
                                required
                                className="w-full px-4 py-3 bg-slate-800 border border-red-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-medium rounded-lg transition-colors"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin inline" size={20} /> : 'Подтвердить удаление'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                    }}
                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};

export default SecuritySettingsPage;
