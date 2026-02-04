import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { BarChart, MapPin, Briefcase, DollarSign, Loader2 } from 'lucide-react';
import ErrorState from './ui/ErrorState';
import { formatCurrency } from '../utils/formatters';

const MetricsSection = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axiosClient.get('/metrics');
                setMetrics(response.data);
            } catch (error) {
                console.error("Failed to fetch metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
                <p>Анализируем рынок...</p>
            </div>
        );
    }

    if (!metrics) {
        return (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <ErrorState
                    title="Не удалось загрузить статистику"
                    message="Не получилось загрузить данные рынка. Попробуйте позже."
                    showHomeLink={false}
                />
            </section>
        );
    }

    // Calculate max value for bar charts to normalize widths
    const maxLocationCount = Math.max(...Object.values(metrics.top_locations));

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BarChart className="text-violet-500" />
                    Аналитика рынка
                </h2>
                <p className="text-slate-400">Актуальные инсайты по IT‑рынку Казахстана.</p>
            </div>

            {/* Top Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    label="Активные вакансии"
                    value={metrics.total_count}
                    icon={<Briefcase className="text-violet-400" />}
                    subtitle="Открытые вакансии"
                />
                <StatCard
                    label="Средняя зарплата Senior"
                    value={formatCurrency(metrics.avg_salary_by_grade['Senior'] || 0, null, 'KZT')}
                    icon={<DollarSign className="text-emerald-400" />}
                    subtitle="₸ на руки"
                />
                <StatCard
                    label="Главный хаб"
                    value={Object.keys(metrics.top_locations)[0] || 'N/A'}
                    icon={<MapPin className="text-amber-400" />}
                    subtitle={`${Object.values(metrics.top_locations)[0] || 0} вакансий`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Location Distribution */}
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-slate-400" />
                        Топ городов
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(metrics.top_locations).map(([city, count], idx) => (
                            <div key={city} className="flex flex-col gap-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-300 font-medium">{city}</span>
                                    <span className="text-slate-500 font-mono">{count} вакансий</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full"
                                        style={{ width: `${(count / maxLocationCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Salary by Grade */}
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <DollarSign size={20} className="text-slate-400" />
                        Зарплата по грейду (₸)
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(metrics.avg_salary_by_grade).map(([grade, salary]) => (
                            <div key={grade} className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                <span className="text-slate-300 font-medium capitalize">{grade}</span>
                                <span className="text-emerald-400 font-bold font-mono">
                                    {formatCurrency(salary, null, 'KZT').replace('KZT', '₸')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Grade Distribution Mini-Bar */}
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <h4 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Спрос по уровню</h4>
                        <div className="flex h-4 rounded-full overflow-hidden w-full">
                            {Object.entries(metrics.grade_distribution).map(([grade, count], idx) => {
                                const total = Object.values(metrics.grade_distribution).reduce((a, b) => a + b, 0);
                                const pct = (count / total) * 100;
                                const colors = ['bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-blue-500'];
                                return (
                                    <div
                                        key={grade}
                                        className={`${colors[idx % colors.length]} hover:brightness-110 transition-all cursor-help`}
                                        style={{ width: `${pct}%` }}
                                        title={`${grade}: ${count} вакансий (${pct.toFixed(1)}%)`}
                                    ></div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500 px-1">
                            {Object.entries(metrics.grade_distribution).map(([grade, count]) => (
                                <span key={grade} className="capitalize">{grade}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const StatCard = ({ label, value, icon, subtitle }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
            {React.cloneElement(icon, { size: 48 })}
        </div>
        <div className="relative z-10">
            <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">{label}</div>
            <div className="text-3xl font-bold text-white mb-2">{value}</div>
            <div className="text-xs text-slate-400 font-mono">
                {subtitle}
            </div>
        </div>
    </div>
);

export default MetricsSection;
