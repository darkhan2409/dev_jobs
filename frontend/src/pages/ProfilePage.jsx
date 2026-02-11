import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, Save, Loader2, FileText, LayoutDashboard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; // Removed unused import
import axiosClient from '../api/axiosClient';
import SkillTagInput from '../components/SkillTagInput';
import { pageVariants } from '../utils/animations';

const GRADES = ["Junior", "Middle", "Senior", "Lead"];

const ProfilePage = () => {
    // const { user: authUser } = useAuth(); // Removed unused authUser
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        full_name: '',
        location: '',
        grade: '',
        skills: [],
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosClient.get('/users/me/profile');
                const data = response.data;

                setFormData({
                    full_name: data.full_name || '',
                    location: data.location || '',
                    grade: data.grade || '',
                    skills: data.skills || [],
                    bio: data.bio || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                setMessage({ type: 'error', text: 'Не удалось загрузить данные профиля' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillsChange = (newSkills) => {
        setFormData(prev => ({ ...prev, skills: newSkills }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await axiosClient.put('/users/me/profile', formData);
            setMessage({ type: 'success', text: 'Профиль обновлён' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage({ type: 'error', text: error.response?.data?.detail || 'Не удалось обновить профиль' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Мой профиль</h1>
                        <p className="text-slate-400">
                            Заполните профиль, чтобы получать более точные рекомендации.
                        </p>
                    </div>
                    <Link
                        to="/security"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                        <Shield size={18} />
                        <span className="hidden sm:inline">Безопасность</span>
                    </Link>
                </div>

                {/* Status Message */}
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Public Profile Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 text-lg font-semibold text-white border-b border-slate-800 pb-4">
                            <User className="text-violet-500" size={24} />
                            <h2>Личные данные</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Имя и фамилия</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Иван Иванов"
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                />
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Город</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Алматы, Казахстан"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    />
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">О себе</label>
                                <div className="relative">
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Расскажите немного о себе…"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                                    />
                                    <FileText className="absolute left-3 top-4 text-slate-500" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                        <div className="flex items-center gap-3 text-lg font-semibold text-white border-b border-slate-800 pb-4">
                            <Briefcase className="text-violet-500" size={24} />
                            <h2>Профессиональный профиль</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {/* Grade */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Текущий грейд</label>
                                <div className="relative">
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Выберите грейд</option>
                                        {GRADES.map(grade => (
                                            <option key={grade} value={grade}>{grade}</option>
                                        ))}
                                    </select>
                                    <LayoutDashboard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Навыки и технологии</label>
                                <SkillTagInput
                                    value={formData.skills}
                                    onChange={handleSkillsChange}
                                    placeholder="Добавьте навыки (например: Python, React, AWS)…"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:mr-1"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            {isSaving ? 'Сохраняем…' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default ProfilePage;
