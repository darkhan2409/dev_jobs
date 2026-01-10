import React from 'react';
import { Terminal, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppHeader = () => {
    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo area */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 group-hover:border-violet-500/50 transition-colors">
                                <Terminal className="h-6 w-6 text-violet-500" />
                            </div>
                            <span className="text-xl font-bold font-mono tracking-tight text-slate-100 group-hover:text-white transition-colors">
                                &lt;DevJobs /&gt;
                            </span>
                        </Link>
                    </div>

                    {/* Navigation - Desktop */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors">
                            Jobs
                        </Link>
                        <a href="#" className="text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors">
                            Companies
                        </a>
                        <a href="#" className="text-sm font-medium text-slate-300 hover:text-violet-400 transition-colors">
                            Salaries
                        </a>
                    </nav>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-3">
                        <button className="btn-ghost text-sm hidden sm:inline-flex">
                            Log In
                        </button>
                        <button className="btn-primary text-sm flex items-center gap-2">
                            <Code2 size={16} />
                            <span>Sign Up</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
