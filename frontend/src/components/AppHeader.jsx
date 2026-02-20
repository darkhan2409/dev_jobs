import React, { useState, useEffect } from 'react';
import { LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { trackEvent } from '../utils/analytics';
import { ANALYTICS_EVENTS } from '../constants/analyticsEvents';

const AppHeader = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalTab, setAuthModalTab] = useState('login');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setIsUserMenuOpen(false);
        };
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

    const trackNavClick = (link, source) => {
        trackEvent(ANALYTICS_EVENTS.NAV_CLICK, {
            source,
            route: location.pathname,
            destination: link.to,
            label: link.label,
        });
    };

    const primaryNavLinks = [
        { to: '/start', label: 'С чего начать', source: 'header' },
        { to: '/jobs', label: 'Вакансии' },
        { to: '/companies', label: 'Компании' },
        { to: '/career', label: 'Карьерный тест' },
        { to: '/guide', label: 'Карта профессий' },
    ];

    const NavLinkItem = ({ to, label, end, source, isPrimary = false }) => {
        const isActive = end
            ? location.pathname === to
            : location.pathname.startsWith(to);
        const toValue = source ? { pathname: to, search: `?source=${source}` } : to;
        const linkMeta = { to, label };

        if (isPrimary) {
            return (
                <NavLink
                    to={toValue}
                    end={end}
                    onClick={() => trackNavClick(linkMeta, 'header_desktop')}
                    className={`relative inline-flex h-9 items-center justify-center px-4 text-base leading-none font-medium rounded-full border transition-all duration-200 ${isActive
                        ? 'bg-white text-[#0B0C10] border-white shadow-lg shadow-white/20'
                        : 'bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#0B0C10] hover:border-white'
                        }`}
                >
                    {label}
                </NavLink>
            );
        }

        return (
            <NavLink
                to={toValue}
                end={end}
                onClick={() => trackNavClick(linkMeta, 'header_desktop')}
                className={`relative px-4 py-2 text-base font-medium transition-colors group ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
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
                    ? 'bg-[#0B0C10]/95 backdrop-blur-md border-b border-gray-800/50'
                    : 'bg-[#0B0C10]/70 backdrop-blur-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="flex items-center gap-1.5 group select-none"
                            onClick={() =>
                                trackEvent(ANALYTICS_EVENTS.NAV_CLICK, {
                                    source: 'header_logo',
                                    route: location.pathname,
                                    destination: '/',
                                    label: 'GitJob',
                                })
                            }
                        >
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
                        <nav className="hidden lg:flex items-center gap-2">
                            {primaryNavLinks.map((link) => (
                                <NavLinkItem key={link.to} {...link} />
                            ))}
                        </nav>

                        {/* Right Side: Auth */}
                        <div className="hidden lg:flex items-center">
                            {/* Vertical Divider */}
                            <div className="h-6 w-px bg-gray-700 mx-6"></div>

                            <div className="flex items-center gap-4">
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
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors border border-gray-700/50 hover:border-gray-600 cursor-pointer"
                                        >
                                            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                                <User size={14} className="text-white" />
                                            </div>
                                            <span className="text-sm text-white hidden sm:inline max-w-[120px] truncate">
                                                {user?.username || user?.email?.split('@')[0] || 'User'}
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
                                                        <p className="text-sm font-medium text-white truncate">{user?.username || user?.email?.split('@')[0] || 'User'}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user?.email || 'No email'}</p>
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
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
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
                                    <div className="flex items-center gap-4 ml-auto">
                                        <button
                                            onClick={openLogin}
                                            className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            Войти
                                        </button>
                                        <button
                                            onClick={openRegister}
                                            className="inline-flex h-9 items-center justify-center px-5 border border-gray-600 bg-transparent text-gray-100 text-sm leading-none font-semibold rounded-full hover:bg-white/10 hover:border-white transition-colors cursor-pointer"
                                        >
                                            Регистрация
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
                            aria-expanded={isMobileMenuOpen}
                            aria-controls="mobile-main-nav"
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
                            className="lg:hidden bg-[#0B0C10]/95 backdrop-blur-xl border-t border-gray-800 overflow-y-auto max-h-[calc(100dvh-4rem)]"
                            id="mobile-main-nav"
                        >
                            <div className="px-4 py-4 space-y-2">
                                {primaryNavLinks.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.source ? { pathname: link.to, search: `?source=${link.source}` } : link.to}
                                        end={link.end}
                                        onClick={() => {
                                            trackNavClick(link, 'header_mobile');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={({ isActive }) =>
                                            `block w-full px-4 py-3 text-base font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 ${link.isPrimary
                                                ? isActive
                                                    ? 'bg-white text-[#0B0C10]'
                                                    : 'bg-white/10 text-white hover:bg-white hover:text-[#0B0C10]'
                                                : isActive
                                                    ? 'text-white bg-gray-800/50'
                                                    : 'text-gray-300 hover:text-white hover:bg-gray-800/30'
                                            }`
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}

                                {/* Mobile Auth */}
                                {!isAuthenticated && (
                                    <div className="pt-4 border-t border-gray-800 space-y-2">
                                        <button
                                            onClick={() => {
                                                openLogin();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 cursor-pointer"
                                        >
                                            Войти
                                        </button>
                                        <button
                                            onClick={() => {
                                                openRegister();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 border border-gray-600 bg-transparent text-gray-100 text-sm font-semibold rounded-lg hover:bg-white/10 hover:border-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 cursor-pointer"
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
                                            className="block px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
                                        >
                                            Мой профиль
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 cursor-pointer"
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
                hideTabs
            />
        </>
    );
};
export default AppHeader;
