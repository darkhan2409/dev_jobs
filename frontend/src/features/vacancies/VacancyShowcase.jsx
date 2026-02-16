import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VacancyCard from './VacancyCard';
import axiosClient from '../../api/axiosClient';
import { Loader2, ArrowRight } from 'lucide-react';

const VacancyShowcase = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchRandomVacancies = async () => {
            try {
                // Fetch latest 50 to get a good pool for randomness
                const response = await axiosClient.get('/vacancies', {
                    params: { per_page: 50 }
                });

                // Shuffle and pick 6
                const items = Array.isArray(response?.data?.items) ? response.data.items : [];
                const shuffled = [...items].sort(() => 0.5 - Math.random());
                setVacancies(shuffled.slice(0, 6));
                setError(false);
            } catch (error) {
                console.error("Failed to fetch showcase vacancies:", error);
                setVacancies([]);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRandomVacancies();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-violet-500" size={32} />
            </div>
        );
    }

    return (
        <section className="py-20 bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100 mb-4">
                            Свежие вакансии
                        </h2>
                        <p className="text-slate-400 max-w-2xl">
                            Подборка последних вакансий от IT‑компаний — от стартапов до крупных команд.
                        </p>
                    </div>
                    <Link
                        to="/jobs"
                        className="hidden md:flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors font-medium group"
                    >
                        Все вакансии
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center">
                        <p className="text-slate-300">Лента вакансий временно недоступна. Попробуйте обновить страницу позже.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vacancies.map((vacancy) => (
                            <VacancyCard key={vacancy.id} vacancy={vacancy} />
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center md:hidden">
                    <Link
                        to="/jobs"
                        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors font-medium"
                    >
                        Все вакансии
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default VacancyShowcase;
