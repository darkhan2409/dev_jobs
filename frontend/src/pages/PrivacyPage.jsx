import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Mail } from 'lucide-react';
import { pageVariants, fadeInUp } from '../utils/animations';

const PrivacyPage = () => {
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
                        <Shield className="text-violet-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-slate-400">Last updated: January 2026</p>
                </motion.div>

                {/* Content */}
                <motion.div variants={fadeInUp} className="space-y-8">
                    {/* Introduction */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Eye className="text-violet-400" size={20} />
                            Introduction
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            DevJobs KZ ("we", "our", or "us") is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard your information
                            when you use our job board platform.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="text-blue-400" size={20} />
                            Data We Collect
                        </h2>
                        <ul className="text-slate-300 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Vacancy Data:</strong> We aggregate publicly available job listings from sources like HH.ru.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Usage Analytics:</strong> Anonymous usage statistics to improve our service.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span><strong>Contact Information:</strong> Only if you voluntarily contact us via email.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Data Usage */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">How We Use Your Data</h2>
                        <ul className="text-slate-300 space-y-3">
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>To display relevant job vacancies</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>To improve our search and filtering algorithms</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-violet-400 mt-1">•</span>
                                <span>To respond to your inquiries</span>
                            </li>
                        </ul>
                    </section>

                    {/* Security */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Lock className="text-green-400" size={20} />
                            Data Security
                        </h2>
                        <p className="text-slate-300 leading-relaxed">
                            We implement industry-standard security measures to protect our systems.
                            However, no method of transmission over the Internet is 100% secure.
                            We strive to use commercially acceptable means to protect your information.
                        </p>
                    </section>

                    {/* Third Party */}
                    <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
                        <p className="text-slate-300 leading-relaxed">
                            When you click "Apply" on a vacancy, you are redirected to the original
                            job listing (e.g., HH.ru). We are not responsible for the privacy practices
                            of these external websites. We recommend reviewing their privacy policies.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="bg-gradient-to-r from-violet-900/30 to-fuchsia-900/30 border border-violet-500/30 rounded-2xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Mail className="text-violet-400" size={20} />
                            Contact Us
                        </h2>
                        <p className="text-slate-300 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <a
                            href="mailto:hello@devjobs.kz"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                        >
                            <Mail size={16} />
                            hello@devjobs.kz
                        </a>
                    </section>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PrivacyPage;
