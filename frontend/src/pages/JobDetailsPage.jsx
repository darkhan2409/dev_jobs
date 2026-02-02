import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { formatSalary, formatDate } from '../utils/formatters';
import { MapPin, Building2, ExternalLink, Globe } from 'lucide-react';
import ErrorState from '../components/ui/ErrorState';
import DOMPurify from 'dompurify';
import JobDetailsSkeleton from './JobDetailsSkeleton';

const JobDetailsPage = () => {
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVacancy = async () => {
            try {
                const response = await axiosClient.get(`/vacancies/${id}`);
                setVacancy(response.data);
            } catch (err) {
                console.error("Failed to fetch vacancy:", err);
                setError("Failed to load vacancy details.");
            } finally {
                setLoading(false);
            }
        };
        fetchVacancy();
    }, [id]);

    useEffect(() => {
        if (vacancy) {
            document.title = `${vacancy.title} | DevJobs`;
        }
        return () => {
            document.title = 'DevJobs - Find Your Dream Job'; // Reset on unmount
        };
    }, [vacancy]);

    if (loading) return <JobDetailsSkeleton />;

    if (error || !vacancy) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <ErrorState
                    title="Vacancy not found"
                    message={error || "This position might have been closed or removed."}
                />
            </div>
        );
    }

    const sanitizedDescription = DOMPurify.sanitize(vacancy.description);

    return (
        <div className="min-h-screen text-slate-200 font-sans pb-24 lg:pb-12">
            <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

                    {/* LEFT COLUMN: Header & Description */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Header Block */}
                        <div className="space-y-4">
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
                                <span>/</span>
                                <span className="text-slate-300 truncate max-w-[300px]">{vacancy.title}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                {vacancy.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-base text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Building2 size={18} className="text-violet-400" />
                                    <span className="text-slate-200 font-medium">{vacancy.company_name}</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} />
                                    <span>{vacancy.location || 'Remote'}</span>
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span>Posted {formatDate(vacancy.published_at)}</span>
                            </div>
                        </div>

                        {/* Description Content */}
                        <div className="bg-slate-900/50 rounded-2xl">
                            <article
                                className="prose prose-invert prose-slate prose-lg max-w-none 
                                prose-headings:text-slate-100 prose-a:text-violet-400 hover:prose-a:text-violet-300
                                prose-strong:text-white prose-li:marker:text-violet-500"
                                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <aside className="lg:col-span-1 relative">
                        <div className="sticky top-24 space-y-6">

                            {/* Card 1: Salary & Apply */}
                            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-black/20">
                                <div className="mb-6">
                                    <p className="text-sm text-slate-400 mb-1">Salary</p>
                                    <div className="text-xl md:text-2xl font-mono font-bold text-emerald-400">
                                        {formatSalary(vacancy.salary_from, vacancy.salary_to, vacancy.currency || 'KZT')}
                                    </div>
                                </div>

                                <a
                                    href={vacancy.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full"
                                >
                                    <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                                        <span>Apply Now</span>
                                        <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </a>

                                <p className="text-xs text-center text-slate-500 mt-3">
                                    Opens on {vacancy.source === 'hh' ? 'HeadHunter' : vacancy.source}
                                </p>
                            </div>

                            {/* Card 1.5: Job Summary (New) */}
                            {vacancy.raw_data && (
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
                                    <h3 className="font-semibold text-white mb-2">Job Details</h3>

                                    <div className="space-y-3 text-sm">
                                        {/* Experience */}
                                        {vacancy.raw_data.experience?.name && (
                                            <div className="flex justify-between items-start pt-2 border-t border-slate-700/50 first:pt-0 first:border-0">
                                                <span className="text-slate-500">Experience</span>
                                                <span className="text-slate-200 font-medium text-right">{vacancy.raw_data.experience.name}</span>
                                            </div>
                                        )}

                                        {/* Employment Type */}
                                        {(vacancy.raw_data.employment?.name || vacancy.raw_data.employment_form?.name) && (
                                            <div className="flex justify-between items-start pt-2 border-t border-slate-700/50">
                                                <span className="text-slate-500">Employment</span>
                                                <span className="text-slate-200 font-medium text-right">
                                                    {vacancy.raw_data.employment?.name || vacancy.raw_data.employment_form?.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Schedule */}
                                        {(vacancy.raw_data.schedule?.name || (vacancy.raw_data.work_schedule_by_days?.[0]?.name)) && (
                                            <div className="flex justify-between items-start pt-2 border-t border-slate-700/50">
                                                <span className="text-slate-500">Schedule</span>
                                                <div className="text-right">
                                                    <div className="text-slate-200 font-medium">
                                                        {vacancy.raw_data.schedule?.name}
                                                    </div>
                                                    {vacancy.raw_data.work_schedule_by_days?.[0]?.name && (
                                                        <div className="text-slate-400 text-xs mt-0.5">
                                                            {vacancy.raw_data.work_schedule_by_days[0].name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Working Hours */}
                                        {vacancy.raw_data.working_hours?.[0]?.name && (
                                            <div className="flex justify-between items-start pt-2 border-t border-slate-700/50">
                                                <span className="text-slate-500">Hours</span>
                                                <span className="text-slate-200 font-medium text-right">
                                                    {vacancy.raw_data.working_hours[0].name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Address / Location Detail */}
                                        {vacancy.raw_data.address && (
                                            <div className="flex justify-between items-start pt-2 border-t border-slate-700/50">
                                                <span className="text-slate-500 shrink-0">Location</span>
                                                <span className="text-slate-200 font-medium text-right truncate pl-4" title={vacancy.raw_data.address.city || vacancy.raw_data.address.raw}>
                                                    {vacancy.raw_data.address.city}
                                                    {vacancy.raw_data.address.street && `, ${vacancy.raw_data.address.street}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Card 2: Tech Stack */}
                            {vacancy.key_skills && vacancy.key_skills.length > 0 && (
                                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                        Key Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vacancy.key_skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm px-3 py-1.5 rounded-lg transition-colors cursor-default"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Card 3: Company Info */}
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-4 overflow-hidden p-2">
                                    {vacancy.company_logo ? (
                                        <img
                                            src={vacancy.company_logo}
                                            alt={vacancy.company_name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Building2 size={32} className="text-slate-800" />
                                    )}
                                </div>
                                <h3 className="font-bold text-white text-lg mb-1">
                                    {vacancy.company_name}
                                </h3>
                                <div className="text-slate-400 text-sm mb-4">
                                    {vacancy.location || 'Kazakhstan'}
                                </div>
                                <Link
                                    to={`/companies/${encodeURIComponent(vacancy.company_name)}`}
                                    className="text-sm text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                                >
                                    <Globe size={14} />
                                    View Company Profile
                                </Link>
                            </div>

                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Fixed Apply Button */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 p-4 z-50">
                <a
                    href={vacancy.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <button className="w-full bg-violet-600 text-white font-semibold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2">
                        <span>Apply Now</span>
                        <ExternalLink size={16} />
                    </button>
                </a>
            </div>
        </div>
    );
};

export default JobDetailsPage;
