import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, X, ChevronDown, Check, Search, DollarSign, Briefcase, Building2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const normalizeGradeValue = (value = '') =>
    value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, 'ru-RU'))
        .join(',');

const buildLocalFilters = (filters = {}) => ({
    search: filters.search || '',
    company: filters.company || '',
    minSalary: filters.minSalary || '',
    location: filters.location || '',
    grade: normalizeGradeValue(filters.grade || ''),
    stack: filters.stack || ''
});

const FilterSidebar = ({ filters, onFilterChange, onFiltersApplied, className = '' }) => {
    const [locations, setLocations] = useState([]);
    const [grades, setGrades] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [filtersLoading, setFiltersLoading] = useState(false);
    const [filtersError, setFiltersError] = useState('');

    const [localFilters, setLocalFilters] = useState(() => buildLocalFilters(filters));

    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const dropdownRef = useRef(null);

    const fetchFilters = useCallback(async () => {
        setFiltersLoading(true);
        setFiltersError('');
        try {
            const response = await axiosClient.get('/filters');
            setLocations(response.data.locations || []);
            setGrades(response.data.grades || []);
            setTechnologies(response.data.technologies || []);
        } catch (error) {
            console.error('Failed to load filters:', error);
            setFiltersError('Failed to load filters. Please try again.');
        } finally {
            setFiltersLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsLocationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTechChange = (tech) => {
        setLocalFilters((prev) => ({
            ...prev,
            stack: prev.stack === tech ? '' : tech
        }));
    };

    const handleGradeChange = (grade) => {
        const currentGrades = normalizeGradeValue(localFilters.grade).split(',').filter(Boolean);
        const nextGrades = currentGrades.includes(grade)
            ? currentGrades.filter((item) => item !== grade)
            : [...currentGrades, grade];

        setLocalFilters((prev) => ({
            ...prev,
            grade: normalizeGradeValue(nextGrades.join(','))
        }));
    };

    const isGradeSelected = (grade) => {
        const currentGrades = normalizeGradeValue(localFilters.grade).split(',').filter(Boolean);
        return currentGrades.includes(grade);
    };

    const handleLocationSelect = (location) => {
        setLocalFilters((prev) => ({
            ...prev,
            location: location === prev.location ? '' : location
        }));
        setIsLocationOpen(false);
        setLocationSearch('');
    };

    const handleSearchChange = (value) => {
        setLocalFilters((prev) => ({
            ...prev,
            search: value
        }));
    };

    const handleCompanyChange = (value) => {
        setLocalFilters((prev) => ({
            ...prev,
            company: value
        }));
    };

    const handleSalaryChange = (value) => {
        const sanitized = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0).toString();
        setLocalFilters((prev) => ({
            ...prev,
            minSalary: sanitized
        }));
    };

    const applyFilters = () => {
        onFilterChange(localFilters, { trigger: 'filter_apply_button' });
        onFiltersApplied?.({ action: 'apply', filters: localFilters });
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            company: '',
            minSalary: '',
            location: '',
            grade: '',
            stack: ''
        };

        setLocalFilters(clearedFilters);
        onFilterChange(clearedFilters, { trigger: 'filter_clear_button' });
        onFiltersApplied?.({ action: 'clear', filters: clearedFilters });
    };

    const hasChanges =
        localFilters.search !== (filters.search || '') ||
        localFilters.company !== (filters.company || '') ||
        localFilters.minSalary !== (filters.minSalary || '') ||
        localFilters.location !== (filters.location || '') ||
        normalizeGradeValue(localFilters.grade) !== normalizeGradeValue(filters.grade || '') ||
        localFilters.stack !== (filters.stack || '');

    const hasActiveFilters =
        Boolean(filters.search) ||
        Boolean(filters.company) ||
        Boolean(filters.stack) ||
        Boolean(filters.grade) ||
        Boolean(filters.location) ||
        Boolean(filters.minSalary);

    const filteredLocations = locations.filter((loc) =>
        loc.toLowerCase().includes(locationSearch.toLowerCase())
    );

    return (
        <aside className={`w-full lg:w-72 flex-shrink-0 relative ${className}`}>
            <div className="sticky top-24 p-1">
                <div className="flex flex-col h-full max-h-[calc(100svh-7rem)]">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
                        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                            <Filter size={16} className="text-purple-500" />
                            Фильтры
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <X size={14} /> Сбросить
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {filtersLoading && (
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                                Loading filters...
                            </div>
                        )}

                        {filtersError && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200 flex items-center justify-between gap-2">
                                <span>{filtersError}</span>
                                <button
                                    onClick={fetchFilters}
                                    className="px-2 py-1 rounded border border-red-400/40 hover:bg-red-500/20 transition-colors cursor-pointer"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Briefcase size={12} />
                                Должность
                            </h4>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="например: React-разработчик, Python..."
                                    value={localFilters.search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Building2 size={12} />
                                Компания
                            </h4>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="например: Яндекс, Kaspi..."
                                    value={localFilters.company}
                                    onChange={(e) => handleCompanyChange(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <DollarSign size={12} />
                                Зарплата
                            </h4>
                            <div className="space-y-2">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Зарплата от (₸)"
                                    value={localFilters.minSalary}
                                    onChange={(e) => handleSalaryChange(e.target.value)}
                                    className="w-full bg-[#0B0C10] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
                                />
                                <p className="text-xs text-slate-600">Можно оставить пустым</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Город</h4>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsLocationOpen((prev) => !prev)}
                                    className="w-full flex items-center justify-between bg-[#0B0C10] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 hover:border-purple-500/50 transition-colors focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                >
                                    <span className="truncate">{localFilters.location || 'Все города'}</span>
                                    <ChevronDown size={16} className={`text-slate-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isLocationOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 flex flex-col">
                                        <div className="p-2 border-b border-slate-700/50 sticky top-0 bg-slate-900">
                                            <div className="relative">
                                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Поиск города..."
                                                    value={locationSearch}
                                                    onChange={(e) => setLocationSearch(e.target.value)}
                                                    className="w-full bg-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 border-none focus:ring-1 focus:ring-violet-500/50"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                            <button
                                                onClick={() => handleLocationSelect('')}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group cursor-pointer ${!localFilters.location
                                                        ? 'bg-violet-500/10 text-violet-300'
                                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                    }`}
                                            >
                                                <span>Все города</span>
                                                {!localFilters.location && <Check size={14} />}
                                            </button>

                                            {filteredLocations.map((loc) => (
                                                <button
                                                    key={loc}
                                                    onClick={() => handleLocationSelect(loc)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group cursor-pointer ${localFilters.location === loc
                                                            ? 'bg-violet-500/10 text-violet-300'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                        }`}
                                                >
                                                    <span>{loc}</span>
                                                    {localFilters.location === loc && <Check size={14} />}
                                                </button>
                                            ))}

                                            {filteredLocations.length === 0 && (
                                                <div className="px-3 py-4 text-center text-xs text-slate-500">Города не найдены</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Грейд</h4>
                            <div className="space-y-2">
                                {grades.map((grade) => (
                                    <label key={grade} className="flex items-center gap-3 cursor-pointer group">
                                        <div
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isGradeSelected(grade)
                                                    ? 'bg-purple-600 border-purple-600'
                                                    : 'border-gray-800 group-hover:border-gray-600 bg-[#0B0C10]'
                                                }`}
                                        >
                                            {isGradeSelected(grade) && <Check size={12} className="text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isGradeSelected(grade)}
                                            onChange={() => handleGradeChange(grade)}
                                        />
                                        <span
                                            className={`text-sm transition-colors ${isGradeSelected(grade)
                                                    ? 'text-white font-medium'
                                                    : 'text-slate-400 group-hover:text-slate-300'
                                                }`}
                                        >
                                            {grade}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Стек</h4>
                            <div className="flex flex-wrap gap-2">
                                {technologies.map((tech) => (
                                    <button
                                        key={tech}
                                        onClick={() => handleTechChange(tech)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${localFilters.stack === tech
                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                                                : 'bg-[#0B0C10] border-gray-800 text-slate-400 hover:border-purple-500/30 hover:text-slate-200'
                                            }`}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 shrink-0">
                        <button
                            onClick={applyFilters}
                            className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${hasChanges
                                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-purple-600/80 hover:bg-purple-600 text-white'
                                }`}
                        >
                            <Search size={18} />
                            Применить фильтры
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
