import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { pageVariants, fadeInUp } from '../utils/animations';

const PostJobPage = () => {
    const benefits = [
        'Access to thousands of IT professionals in Kazakhstan',
        'AI-powered matching with relevant candidates',
        'Clean, developer-focused platform',
        'Transparent pricing (coming soon)',
    ];

    return (
        <motion.div
            className="min-h-screen pt-24 pb-16"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div variants={fadeInUp} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl mb-6">
                        <Building2 className="text-violet-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">For Employers</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Reach top IT talent in Kazakhstan through our platform
                    </p>
                </motion.div>

                {/* Current Status */}
                <motion.div variants={fadeInUp} className="mb-12">
                    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-3">🚧 Coming Soon</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We're currently building our employer portal. Right now, DevJobs aggregates
                            vacancies from HH.ru automatically. Soon, you'll be able to post jobs directly
                            on our platform.
                        </p>
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Why Post on DevJobs?</h2>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <ul className="space-y-4">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                                    <span className="text-slate-300">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.section>

                {/* Current Options */}
                <motion.section variants={fadeInUp} className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Current Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Post on HH.ru</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Post your IT vacancy on HeadHunter and it will automatically appear on DevJobs.
                            </p>
                            <a
                                href="https://hh.kz/employer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                Go to HH.kz
                                <ArrowRight size={14} />
                            </a>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-3">Priority Listing</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Want featured placement? Contact us directly for premium options.
                            </p>
                            <a
                                href="mailto:employers@devjobs.kz"
                                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                Contact Us
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </motion.section>

                {/* Contact CTA */}
                <motion.section variants={fadeInUp}>
                    <div className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Get Early Access</h2>
                        <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                            Be the first to know when our employer portal launches.
                            Get exclusive early-bird pricing.
                        </p>
                        <a
                            href="mailto:employers@devjobs.kz?subject=Early Access Request"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
                        >
                            <Mail size={18} />
                            Request Early Access
                        </a>
                    </div>
                </motion.section>
            </div>
        </motion.div>
    );
};

export default PostJobPage;
