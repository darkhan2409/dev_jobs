import React, { useState, useEffect } from 'react';
import { Terminal, Code2, LogOut, User, ChevronDown } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import Button from './ui/Button';

const AppHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const location = useLocation();
    const { user, isAuthenticated, logout, isLoading } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setIsUserMenuOpen(false);
        if (isUserMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isUserMenuOpen]);

    const openLogin = () => {
        setAuthModalTab('login');
        setIsAuthModalOpen(true);
    };

    const openRegister = () => {
        setAuthModalTab('register');
        setIsAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
    };

    const navLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive
            ? 'text-white bg-primary/20 border border-primary/30'
            : 'text-text-muted hover:text-white hover:bg-white/5'
        }`;

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
                    ? 'bg-background/80 backdrop-blur-2xl border-b border-white/5'
                    : 'bg-transparent border-b border-transparent backdrop-blur-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo area */}
                        <div className="flex items-center gap-3">
                            <Link to="/" className="flex items-center gap-2 group">
                                <motion.div
                                    whileHover={{
                                        boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)",
                                        borderColor: "rgba(124, 58, 237, 0.8)"
                                    }}
                                    className="bg-surface/50 p-2 rounded-lg border border-border transition-all duration-300 group-hover:bg-surface"
                                >
                                    <Terminal className="h-6 w-6 text-primary-light group-hover:text-primary transition-colors" />
                                </motion.div>
                                <span className="text-xl font-bold font-mono tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                                    &lt;DevJobs /&gt;
                                </span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            <NavLink to="/jobs" className={navLinkClass}>
                                Вакансии
                            </NavLink>
                            <NavLink to="/companies" className={navLinkClass}>
                                Компании
                            </NavLink>
                            <NavLink to="/career" className={navLinkClass}>
                                Карьерный тест
                            </NavLink>
                            <NavLink to="/about" className={navLinkClass}>
                                О нас
                            </NavLink>
                        </nav>

                        {/* Auth Actions */}
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <div className="w-20 h-8 bg-surface rounded-lg animate-pulse"></div>
                            ) : isAuthenticated ? (
                                /* User Menu */
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsUserMenuOpen(!isUserMenuOpen);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 bg-surface hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-border"
                                    >
                                        <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                                            <User size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm text-text-main hidden sm:inline max-w-[120px] truncate">
                                            {user?.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown size={14} className={`text-text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-border">
                                                    <p className="text-xs text-text-muted">Вы вошли как</p>
                                                    <p className="text-sm text-white truncate">{user?.email}</p>
                                                </div>
                                                <div className="p-1">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <User size={14} />
                                                        Мой профиль
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    >
                                                        <LogOut size={14} />
                                                        Выйти
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                /* Login/Register Buttons */
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={openLogin}
                                        className="hidden sm:inline-flex"
                                    >
                                        Войти
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={openRegister}
                                        icon={Code2}
                                        as={motion.button}
                                    >
                                        Регистрация
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                defaultTab={authModalTab}
            />
        </>
    );
};
export default AppHeader;
