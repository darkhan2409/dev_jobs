import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const AppFooter = () => {
    return (
        <footer className="border-t border-slate-800 bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="text-lg font-bold font-mono text-slate-100 mb-2">
                            &lt;DevJobs /&gt;
                        </div>
                        <p className="text-sm text-slate-500">
                            The open-source job board for Kazakhstan's developer community.
                            <br />
                            Built with ❤️ by developers.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-500 hover:text-violet-400 transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="text-slate-500 hover:text-blue-500 transition-colors">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-600 font-mono">
                    © {new Date().getFullYear()} DevJobs KZ. git commit -m "initial release"
                </div>
            </div>
        </footer>
    );
};

export default AppFooter;
