import React, { useState, useEffect } from 'react';
import { Terminal, Code2, LogOut, User, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

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

    return (
        <>
            <header
                className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
                    ? 'bg-[#0A0F1E]/80 backdrop-blur-2xl shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.08)]'
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
                                        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                                        borderColor: "rgba(139, 92, 246, 0.8)"
                                    }}
                                    className="bg-slate-900/50 p-2 rounded-lg border border-slate-700 transition-all duration-300 group-hover:bg-slate-800"
                                >
                                    <Terminal className="h-6 w-6 text-violet-500 group-hover:text-violet-400 transition-colors" />
                                </motion.div>
                                <span className="text-xl font-bold font-mono tracking-tight text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                                    &lt;DevJobs /&gt;
                                </span>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center gap-1">
                            <Link to="/jobs" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                Vacancies
                            </Link>
                            <Link to="/companies" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                Companies
                            </Link>
                            <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                                About Us
                            </Link>
                        </nav>

                        {/* Auth Actions */}
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <div className="w-20 h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                            ) : isAuthenticated ? (
                                /* User Menu */
                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsUserMenuOpen(!isUserMenuOpen);
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <div className="w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center">
                                            <User size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm text-slate-200 hidden sm:inline max-w-[120px] truncate">
                                            {user?.email?.split('@')[0]}
                                        </span>
                                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-slate-800">
                                                    <p className="text-xs text-slate-500">Signed in as</p>
                                                    <p className="text-sm text-white truncate">{user?.email}</p>
                                                </div>
                                                <div className="p-1">
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <User size={14} />
                                                        My Profile
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                    >
                                                        <LogOut size={14} />
                                                        Log Out
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
                                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:inline-block"
                                    >
                                        Log In
                                    </button>
                                    <motion.button
                                        onClick={openRegister}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 hover:bg-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-violet-500/10"
                                    >
                                        <Code2 size={16} />
                                        <span>Sign Up</span>
                                    </motion.button>
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
