import React from 'react';
import { Send, Bell } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="relative px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] border border-violet-500/20 p-8 md:p-12 text-center md:text-left shadow-2xl shadow-violet-900/10">

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-violet-600/10 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-fuchsia-600/10 blur-3xl rounded-full pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex-1 space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                Don't miss your dream job
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Stop refreshing the page. Subscribe to our Telegram bot and get instant notifications for new vacancies matching your stack.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-violet-600/20 transform hover:-translate-y-0.5">
                                <Send size={20} />
                                <span>Join Telegram</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-xl border border-slate-700 transition-all">
                                <Bell size={20} />
                                <span>Enable Alerts</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
