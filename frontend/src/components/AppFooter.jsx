import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppFooter = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 mt-auto pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {/* 1. Brand & Vision */}
                    <div className="space-y-6">
                        <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
                            &lt;DevJobs /&gt;
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            The open-source job board built for developers, by developers.
                            We connect talent with opportunity using AI-powered matching and
                            transparent insights. No noise, just code.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                <Github size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-800 transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* 2. Quick Links & Contact */}
                    <div className="flex flex-col md:items-end space-y-6">
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium">
                            <Link to="/jobs" className="text-slate-400 hover:text-violet-400 transition-colors">Browse Jobs</Link>
                            <Link to="/companies" className="text-slate-400 hover:text-violet-400 transition-colors">Companies</Link>
                            <Link to="/post-job" className="text-slate-400 hover:text-violet-400 transition-colors">For Employers</Link>
                            <Link to="/privacy" className="text-slate-400 hover:text-violet-400 transition-colors">Privacy</Link>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                            <div className="bg-slate-800 p-2 rounded-md text-violet-400">
                                <Mail size={18} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Contact Us</span>
                                <a href="mailto:hello@devjobs.kz" className="text-slate-200 hover:text-white text-sm">hello@devjobs.kz</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
                    <div>
                        © {new Date().getFullYear()} DevJobs KZ. Open Source.
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <Heart size={12} className="text-red-500 fill-red-500" />
                        <span>in Kazakhstan</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
