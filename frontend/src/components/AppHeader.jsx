import React, { useState, useEffect } from 'react';
import { LogOut, User, ChevronDown, ClipboardList, Map, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const AppHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsUserMenuOpen(false);
            setIsNavigatorOpen(false);
        };
        if (isUserMenuOpen || isNavigatorOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isUserMenuOpen, isNavigatorOpen]);

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

    const navLinks = [
        { to: '/', label: 'Главная', end: true },
        { to: '/jobs', label: 'Вакансии' },
        { to: '/companies', label: 'Компании' },
        { to: '/about', label: 'О нас' },
    ];

    const NavLinkItem = ({ to, label, end }) => {
        const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to);

        return (
            <NavLink
                to={to}
                end={end}
                className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
            >
                {label}
                {/* Active indicator - glowing dot */}
                {isActive && (
                    <motion.span
                        layoutId="activeTab"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{
                            boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)'
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
            </NavLink>
        );
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'bg-[#0B0C10]/80 backdrop-blur-md border-b border-gray-800/50'
                        : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-1.5 group select-none">
                            {/* 1. Logo Icon (Square with GitMerge) */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-600 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 rounded-xl"></div>
                                <div className="relative h-12 w-12 bg-[#1A1B26] border border-purple-500/30 rounded-xl flex items-center justify-center shadow-xl group-hover:border-purple-500/60 group-hover:scale-105 transition-all duration-300">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-purple-400 w-7 h-7 -rotate-90 group-hover:text-white transition-colors"
                                    >
                                        <circle cx="18" cy="18" r="3" />
                                        <circle cx="6" cy="6" r="3" />
                                        <path d="M6 21V9a9 9 0 0 0 9 9" />
                                    </svg>
                                </div>
                            </div>

                            {/* 2. Text Block */}
                            <div className="flex flex-col">
                                <div className="flex items-baseline">
                                    <span className="text-[1.7rem] font-bold font-mono text-white tracking-tight group-hover:text-purple-100 transition-colors">
                                        GitJob
                                    </span>
                                    <span className="text-[2.1rem] text-purple-500 leading-none animate-pulse">.</span>
                                </div>
                                <span className="text-[11px] font-mono font-semibold text-gray-500 tracking-[0.08em]">
                                    commit to your future
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <NavLinkItem key={link.to} {...link} />
                            ))}

                            {/* Dropdown: Путь в IT */}
                            <div
                                className="relative"
                                onMouseEnter={() => setIsNavigatorOpen(true)}
                                onMouseLeave={() => setIsNavigatorOpen(false)}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsNavigatorOpen(!isNavigatorOpen);
                                    }}
                                    className={`relative px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${location.pathname === '/career' || location.pathname.startsWith('/guide')
                                            ? 'text-white'
                                            : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Путь в IT
                                    <ChevronDown
                                        size={14}
                                        className={`transition-transform ${isNavigatorOpen ? 'rotate-180' : ''}`}
                                    />
                                    {/* Active indicator */}
                                    {(location.pathname === '/career' || location.pathname.startsWith('/guide')) && (
                                        <motion.span
                                            layoutId="activeTab"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                            style={{
                                                boxShadow: '0 0 8px rgba(168, 85, 247, 0.8)'
                                            }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {isNavigatorOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="absolute left-0 mt-2 w-64 bg-[#0B0C10]/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                                        >
                                            <div className="p-2">
                                                <Link
                                                    to="/career"
                                                    onClick={() => setIsNavigatorOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30"
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                                        <ClipboardList size={18} className="text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                            Кто я в IT?
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Пройди тест
                                                        </p>
                                                    </div>
                                                </Link>

                                                <Link
                                                    to="/guide"
                                                    onClick={() => setIsNavigatorOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 mt-1"
                                                >
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                                        <Map size={18} className="text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                            Карта профессий
                                                        </h4>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Этапы разработки
                                                        </p>
                                                    </div>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </nav>

                        {/* Right Side: Auth */}
                        <div className="hidden md:flex items-center gap-4">
                            {isLoading ? (
                                <div className="w-20 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                            ) : isAuthenticated ? (
                                /* User Menu */
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsUserMenuOpen(!isUserMenuOpen);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors border border-gray-700/50 hover:border-gray-600"
                                    >
                                        <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                            <User size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm text-white hidden sm:inline max-w-[120px] truncate">
                                            {user?.username || user?.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute right-0 mt-2 w-48 bg-[#0B0C10]/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-gray-800">
                                                    <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                                </div>
                                                <div className="p-2">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                                                    >
                                                        <User size={14} />
                                                        Мой профиль
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
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
                                    <button
                                        onClick={openLogin}
                                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                    >
                                        Войти
                                    </button>
                                    <button
                                        onClick={openRegister}
                                        className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        Регистрация
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#0B0C10]/95 backdrop-blur-xl border-t border-gray-800"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        end={link.end}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                                ? 'text-white bg-gray-800/50'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}

                                {/* Mobile Dropdown Items */}
                                <Link
                                    to="/career"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors"
                                >
                                    Кто я в IT?
                                </Link>
                                <Link
                                    to="/guide"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors"
                                >
                                    Карта профессий
                                </Link>

                                {/* Mobile Auth */}
                                {!isAuthenticated && (
                                    <div className="pt-4 border-t border-gray-800 space-y-2">
                                        <button
                                            onClick={() => {
                                                openLogin();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors text-left"
                                        >
                                            Войти
                                        </button>
                                        <button
                                            onClick={() => {
                                                openRegister();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            Регистрация
                                        </button>
                                    </div>
                                )}

                                {isAuthenticated && (
                                    <div className="pt-4 border-t border-gray-800 space-y-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="block px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors"
                                        >
                                            Мой профиль
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors text-left"
                                        >
                                            Выйти
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
