import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, User, Check, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordRequirements from './PasswordRequirements';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login', hideTabs = false }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Sync activeTab with defaultTab prop when modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
            resetForm(); // Clear fields as well
        }
    }, [isOpen, defaultTab]);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const modalRef = useRef(null);

    const { login, register } = useAuth();

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccessMessage('');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        resetForm();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            onClose();
            resetForm();
        } catch (err) {
            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 401) {
                setError('Неверный email или пароль');
            } else if (status === 429) {
                setError('Слишком много попыток входа. Попробуйте через минуту.');
            } else if (status === 400) {
                setError(detail || 'Ошибка входа');
            } else {
                setError(detail || 'Не удалось войти. Попробуйте ещё раз.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setIsLoading(true);
        try {
            await register(username, email, password);
            if (hideTabs) {
                setSuccessMessage('Аккаунт создан. Теперь можно войти через кнопку «Войти».');
                setTimeout(() => {
                    setSuccessMessage('');
                    onClose();
                    resetForm();
                }, 1500);
            } else {
                setSuccessMessage('Аккаунт создан. Теперь можно войти.');
                setTimeout(() => {
                    setActiveTab('login');
                    setSuccessMessage('');
                    setPassword('');
                    setConfirmPassword('');
                }, 1500);
            }
        } catch (err) {
            const status = err.response?.status;
            const detail = err.response?.data?.detail;

            if (status === 422) {
                if (Array.isArray(detail)) {
                    const errors = detail.map(err => {
                        let msg = err.msg;
                        if (msg.includes('pattern')) {
                            return 'Логин может содержать только буквы (латиница/кириллица), цифры, точки, тире и подчеркивания';
                        }
                        if (msg.includes('at least 7 characters')) {
                            return 'Пароль должен быть не менее 7 символов (6 букв + 1 цифра)';
                        }
                        if (msg.includes('at least 3 characters')) {
                            return 'Логин должен быть не менее 3 символов';
                        }
                        // Strip Pydantic's "Value error, " prefix
                        return msg.replace('Value error, ', '');
                    }).join('. ');
                    setError(errors);
                } else {
                    setError(detail);
                }
            } else if (status === 429) {
                setError('Слишком много попыток регистрации. Попробуйте через минуту.');
            } else if (status === 400) {
                setError(detail || 'Ошибка регистрации');
            } else {
                setError(detail || 'Не удалось зарегистрироваться. Попробуйте ещё раз.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousActiveElement = document.activeElement;
        document.body.style.overflow = 'hidden';

        const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        const setInitialFocus = () => {
            const focusable = modalRef.current?.querySelectorAll(focusableSelector);
            if (focusable && focusable.length > 0) {
                focusable[0].focus();
            } else {
                modalRef.current?.focus();
            }
        };

        const handleKeydown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusable = modalRef.current?.querySelectorAll(focusableSelector);
            if (!focusable || focusable.length === 0) {
                event.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeydown);
        requestAnimationFrame(setInitialFocus);

        return () => {
            document.removeEventListener('keydown', handleKeydown);
            document.body.style.overflow = '';
            if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                previousActiveElement.focus();
            }
        };
    }, [isOpen, onClose, activeTab]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="auth-modal-title"
                    tabIndex={-1}
                    className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <h2 id="auth-modal-title" className="text-xl font-bold text-white">
                            {activeTab === 'login' ? 'С возвращением' : 'Создать аккаунт'}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Закрыть окно авторизации"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    {!hideTabs && (
                        <div className="flex border-b border-slate-800">
                            <button
                                onClick={() => handleTabChange('login')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'login'
                                    ? 'text-violet-400 border-b-2 border-violet-400'
                                    : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Войти
                            </button>
                            <button
                                onClick={() => handleTabChange('register')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'register'
                                    ? 'text-violet-400 border-b-2 border-violet-400'
                                    : 'text-slate-400 hover:text-slate-300'
                                    }`}
                            >
                                Регистрация
                            </button>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="p-6 space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                                <CheckCircle size={16} />
                                {successMessage}
                            </div>
                        )}

                        {/* Login (Username) - Register only */}
                        {activeTab === 'register' && (
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Логин</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder=""
                                        required
                                        autoComplete="username"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email/Username Login */}
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Электронная почта</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm text-slate-400">Пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete={activeTab === 'register' ? "new-password" : "current-password"}
                                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Requirements (Register only) */}
                            {activeTab === 'register' && password && (
                                <div className="space-y-3 pt-2">
                                    <PasswordRequirements password={password} />
                                </div>
                            )}
                        </div>

                        {/* Confirm Password (Register only) */}
                        {activeTab === 'register' && (
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Повторите пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="new-password"
                                        className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <div className={`mt-2 flex items-center gap-1.5 text-xs transition-colors ${password === confirmPassword
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                        }`}>
                                        {password === confirmPassword ? (
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
                        )}



                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    {activeTab === 'login' ? 'Входим…' : 'Создаём аккаунт…'}
                                </>
                            ) : (
                                activeTab === 'login' ? 'Войти' : 'Создать аккаунт'
                            )}
                        </button>

                        {/* Forgot Password Link (Login only) */}
                        {activeTab === 'login' && (
                            <div className="text-center">
                                <Link
                                    to="/forgot-password"
                                    onClick={onClose}
                                    className="text-sm text-slate-400 hover:text-violet-400 transition-colors"
                                >
                                    Забыли пароль?
                                </Link>
                            </div>
                        )}
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AuthModal;
