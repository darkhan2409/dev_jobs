import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/adminApi';

const EVENT_LABELS = {
    nav_click: 'Навигация',
    start_mode_jobs_click: 'Выбор: Вакансии',
    start_mode_newbie_click: 'Выбор: Новичок',
    career_test_start: 'Тест начат',
    career_test_complete: 'Тест завершён',
    guide_stage_open: 'Открыт этап гайда',
    optional_jobs_from_guide_click: 'Вакансии из гайда',
    jobs_filter_apply: 'Фильтр применён',
    vacancy_open: 'Открыта вакансия',
    apply_click: 'Клик "Откликнуться"',
};

function StatCard({ label, value, sub }) {
    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-semibold text-slate-100">{value ?? '—'}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
    );
}

function MiniBar({ value, max }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
        </div>
    );
}

function DayChart({ data }) {
    if (!data?.length) return <p className="text-xs text-slate-500">Нет данных</p>;
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div
                        className="w-full bg-violet-500/70 rounded-sm hover:bg-violet-400 transition-colors"
                        style={{ height: `${Math.max(2, Math.round((d.count / max) * 56))}px` }}
                    />
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-300 bg-slate-800 px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {d.date.slice(5)}: {d.count}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function AdminPage() {
    const { user, isLoading } = useAuth();
    const [days, setDays] = useState(7);
    const [data, setData] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;
        setLoading(true);
        setError(null);
        Promise.all([adminApi.getAnalytics(days), adminApi.getStats()])
            .then(([analyticsRes, statsRes]) => {
                setData(analyticsRes.data);
                setStats(statsRes.data);
            })
            .catch(() => setError('Не удалось загрузить данные'))
            .finally(() => setLoading(false));
    }, [days, user]);

    if (isLoading) return null;
    if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

    const userTypes = data?.user_types || {};
    const totalTyped = Object.values(userTypes).reduce((a, b) => a + b, 0) || 1;
    const maxEventCount = data?.top_events?.[0]?.count || 1;
    const maxRouteCount = data?.top_routes?.[0]?.count || 1;

    return (
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-semibold text-slate-100">Аналитика</h1>
                <div className="flex gap-1">
                    {[7, 14, 30].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${days === d ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'}`}
                        >
                            {d}д
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-400 mb-6">{error}</p>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <StatCard label="Событий" value={loading ? '...' : data?.total_events?.toLocaleString()} sub={`за ${days} дней`} />
                <StatCard label="Сессий" value={loading ? '...' : data?.unique_sessions?.toLocaleString()} />
                <StatCard label="Пользователей" value={loading ? '...' : stats?.users?.total?.toLocaleString()} />
                <StatCard label="Вакансий" value={loading ? '...' : stats?.vacancies?.active?.toLocaleString()} />
            </div>

            {/* User types + chart */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 mb-4">Тип пользователей</p>
                    <div className="space-y-3">
                        {[['newbie', 'Новички'], ['returning', 'Опытные'], ['unknown', 'Неизвестно']].map(([key, label]) => (
                            <div key={key}>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>{label}</span>
                                    <span>{userTypes[key] || 0} ({Math.round(((userTypes[key] || 0) / totalTyped) * 100)}%)</span>
                                </div>
                                <MiniBar value={userTypes[key] || 0} max={totalTyped} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 mb-4">События по дням</p>
                    {loading ? <div className="h-16 bg-slate-800/30 rounded animate-pulse" /> : <DayChart data={data?.events_per_day} />}
                </div>
            </div>

            {/* Top events + routes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 mb-4">Топ событий</p>
                    {loading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-800/50 rounded animate-pulse" />)}</div>
                    ) : (
                        <div className="space-y-2.5">
                            {data?.top_events?.map(e => (
                                <div key={e.event_name}>
                                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                                        <span>{EVENT_LABELS[e.event_name] || e.event_name}</span>
                                    </div>
                                    <MiniBar value={e.count} max={maxEventCount} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <p className="text-xs text-slate-500 mb-4">Топ страниц</p>
                    {loading ? (
                        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-800/50 rounded animate-pulse" />)}</div>
                    ) : (
                        <div className="space-y-2.5">
                            {data?.top_routes?.map(r => (
                                <div key={r.route}>
                                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                                        <span className="truncate max-w-[160px]">{r.route}</span>
                                    </div>
                                    <MiniBar value={r.count} max={maxRouteCount} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
