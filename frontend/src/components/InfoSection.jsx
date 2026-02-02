import React from 'react';
import { Sparkles, BarChart, Zap, ShieldCheck } from 'lucide-react';

const InfoSection = () => {
    return (
        <section className="py-16 bg-slate-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Sparkles className="text-violet-400" size={24} />}
                        title="AI Filtering"
                        description="Our algorithms strip away the noise. No HR spam, just relevant listings for developers."
                    />
                    <FeatureCard
                        icon={<BarChart className="text-emerald-400" size={24} />}
                        title="Smart Grading"
                        description="Automatic classification of Junior, Middle, and Senior roles based on salary and skills."
                    />
                    <FeatureCard
                        icon={<Zap className="text-amber-400" size={24} />}
                        title="Direct Access"
                        description="Apply directly to the company. No middlemen, no registration walls."
                    />
                </div>
            </div>
        </section>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-violet-500/30 transition-all duration-300 group">
        <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-200 transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
            {description}
        </p>
    </div>
);

export default InfoSection;
