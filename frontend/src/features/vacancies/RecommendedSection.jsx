import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, UserPlus } from 'lucide-react';
import VacancyCard from './VacancyCard';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Skeleton from '../../components/ui/Skeleton';

const RecommendedSection = () => {
    const { isAuthenticated, user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchRecommendations = async () => {
            try {
                const response = await axiosClient.get('/recommendations');
                setRecommendations(response.data);
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <section className="py-20 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-8">
                        <Skeleton variant="circle" className="w-8 h-8" />
                        <Skeleton variant="text" className="w-1/3 h-8" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} variant="card" className="h-[280px]" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // Checking if user has a profile based on recommendations logic or explicit check
    // If backend returns data, we assume it's good "smart" recommendations IF user has skills/grade
    // But backend fallback returns "latest 20" if no profile.
    // How to distinguish? logic: 
    // We can check user.grade or user.skills here on frontend to decide if it's "Personalized" or "Default".
    // Or simpler: If user has empty skills/grade, show CTA regardless of results (which are fallbacks).
    const hasProfile = user?.grade || (user?.skills && user.skills.length > 0);

    return (
        <section className="py-20 bg-gradient-to-b from-slate-900 via-violet-900/5 to-slate-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                <Sparkles size={20} />
                            </span>
                            <h2 className="text-3xl font-bold text-slate-100">
                                Подобрано для вас
                            </h2>
                        </div>
                        <p className="text-slate-400 max-w-2xl pl-12">
                            {hasProfile
                                ? "Рекомендации по вашему грейду и навыкам."
                                : "Заполните профиль, чтобы получать более точные рекомендации."}
                        </p>
                    </div>
                </div>

                {!hasProfile && (
                    <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/20 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-violet-500/20 rounded-full text-violet-300">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Сделайте подбор точнее</h3>
                                <p className="text-slate-300">Укажите грейд и ключевые навыки — покажем самые релевантные вакансии.</p>
                            </div>
                        </div>
                        <Link
                            to="/profile"
                            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-violet-500/20 whitespace-nowrap"
                        >
                            Заполнить профиль
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Show top 6 from recommendations (which might be fallbacks) */}
                    {recommendations.slice(0, 6).map((vacancy) => (
                        <VacancyCard key={vacancy.id} vacancy={vacancy} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecommendedSection;
