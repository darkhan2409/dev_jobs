import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, Check, Search, DollarSign, Briefcase } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSidebar = ({ filters, onFilterChange, className = '' }) => {
    const [locations, setLocations] = useState([]);
    const [grades, setGrades] = useState([]);
    const [technologies, setTechnologies] = useState([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Local filter state (not applied until user clicks Search)
    const [localFilters, setLocalFilters] = useState({
        search: '',
        minSalary: '',
        location: '',
        grade: '',
        stack: ''
    });

    // Dropdown state
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const dropdownRef = useRef(null);

    // Sync local filters with URL filters on mount and when URL changes
    useEffect(() => {
        setLocalFilters({
            search: filters.search || '',
            minSalary: filters.minSalary || '',
            location: filters.location || '',
            grade: filters.grade || '',
            stack: filters.stack || ''
        });
    }, [filters.search, filters.minSalary, filters.location, filters.grade, filters.stack]);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const response = await axiosClient.get('/filters');
                setLocations(response.data.locations || []);
                setGrades(response.data.grades || []);
                setTechnologies(response.data.technologies || []);
            } catch (error) {
                console.error("Failed to load filters:", error);
            }
        };
        fetchFilters();
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsLocationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Local handlers - only update local state
    const handleTechChange = (tech) => {
        setLocalFilters(prev => ({
            ...prev,
            stack: prev.stack === tech ? '' : tech
        }));
    };

    const handleGradeChange = (grade) => {
        const currentGrades = localFilters.grade ? localFilters.grade.split(',').filter(g => g) : [];
        const newGrades = currentGrades.includes(grade)
            ? currentGrades.filter(g => g !== grade)
            : [...currentGrades, grade];
        setLocalFilters(prev => ({
            ...prev,
            grade: newGrades.join(',')
        }));
    };

    const isGradeSelected = (grade) => {
        const currentGrades = localFilters.grade ? localFilters.grade.split(',') : [];
        return currentGrades.includes(grade);
    };

    const handleLocationSelect = (loc) => {
        setLocalFilters(prev => ({
            ...prev,
            location: loc === prev.location ? '' : loc
        }));
        setIsLocationOpen(false);
        setLocationSearch('');
    };

    const handleSearchChange = (value) => {
        setLocalFilters(prev => ({
            ...prev,
            search: value
        }));
    };

    const handleSalaryChange = (value) => {
        // Prevent negative values
        const sanitized = value === '' ? '' : Math.max(0, parseInt(value) || 0).toString();
        setLocalFilters(prev => ({
            ...prev,
            minSalary: sanitized
        }));
    };

    // Apply filters - this actually triggers the search
    const applyFilters = () => {
        onFilterChange({
            ...filters,
            ...localFilters
        });
        setIsMobileOpen(false);
    };

    // Clear all filters
    const clearFilters = () => {
        const clearedFilters = {
            search: '',
            minSalary: '',
            location: '',
            grade: '',
            stack: ''
        };
        setLocalFilters(clearedFilters);
        onFilterChange({
            ...filters,
            ...clearedFilters
        });
    };

    // Check if there are pending changes
    const hasChanges =
        localFilters.search !== (filters.search || '') ||
        localFilters.minSalary !== (filters.minSalary || '') ||
        localFilters.location !== (filters.location || '') ||
        localFilters.grade !== (filters.grade || '') ||
        localFilters.stack !== (filters.stack || '');

    // Check if any filters are active
    const hasActiveFilters = localFilters.search || localFilters.stack || localFilters.grade || localFilters.location || localFilters.minSalary;

    // Filter locations based on search
    const filteredLocations = locations.filter(loc =>
        loc.toLowerCase().includes(locationSearch.toLowerCase())
    );

    const filterUI = (
        <div className="flex flex-col h-full max-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50 shrink-0">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Filter size={20} className="text-violet-500" />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <X size={14} /> Reset
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

            {/* Search Filter */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={14} />
                    Job Title
                </h4>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="e.g. React Developer, Python..."
                        value={localFilters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                applyFilters();
                            }
                        }}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                </div>
            </div>

            {/* Salary Filter */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={14} />
                    Salary
                </h4>
                <div className="space-y-2">
                    <input
                        type="number"
                        min="0"
                        placeholder="Min salary (KZT)"
                        value={localFilters.minSalary}
                        onChange={(e) => handleSalaryChange(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                    />
                    <p className="text-xs text-slate-500">Leave empty to show all</p>
                </div>
            </div>

            {/* Location Filter - Dropdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Location</h4>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                        className="w-full flex items-center justify-between bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 hover:border-violet-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                        <span className="truncate">
                            {localFilters.location || 'All Locations'}
                        </span>
                        <ChevronDown size={16} className={`text-slate-500 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isLocationOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 flex flex-col"
                            >
                                <div className="p-2 border-b border-slate-700/50 sticky top-0 bg-slate-900">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search city..."
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
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${!localFilters.location ? 'bg-violet-500/10 text-violet-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                            }`}
                                    >
                                        <span>All Locations</span>
                                        {!localFilters.location && <Check size={14} />}
                                    </button>

                                    {filteredLocations.map(loc => (
                                        <button
                                            key={loc}
                                            onClick={() => handleLocationSelect(loc)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${localFilters.location === loc ? 'bg-violet-500/10 text-violet-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                }`}
                                        >
                                            <span>{loc}</span>
                                            {localFilters.location === loc && <Check size={14} />}
                                        </button>
                                    ))}

                                    {filteredLocations.length === 0 && (
                                        <div className="px-3 py-4 text-center text-xs text-slate-500">
                                            No locations found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Grade Filter (Multi-select) */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Grade</h4>
                <div className="space-y-2">
                    {grades.map(grade => (
                        <label key={grade} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isGradeSelected(grade)
                                ? 'bg-violet-600 border-violet-600'
                                : 'border-slate-700 group-hover:border-slate-500 bg-slate-900'
                                }`}>
                                {isGradeSelected(grade) && <Check size={12} className="text-white" />}
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={isGradeSelected(grade)}
                                onChange={() => handleGradeChange(grade)}
                            />
                            <span className={`text-sm transition-colors ${isGradeSelected(grade) ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'
                                }`}>
                                {grade}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Tech Stack Filter */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                    {technologies.map(tech => (
                        <button
                            key={tech}
                            onClick={() => handleTechChange(tech)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${localFilters.stack === tech
                                ? 'bg-violet-500/20 border-violet-500/50 text-violet-200'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                                }`}
                        >
                            {tech}
                        </button>
                    ))}
                </div>
            </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-800/50 shrink-0">
                <button
                    onClick={applyFilters}
                    className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        hasChanges
                            ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                            : 'bg-violet-600 hover:bg-violet-500 text-white'
                    }`}
                >
                    <Search size={18} />
                    Apply Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:block w-72 flex-shrink-0 relative ${className}`}>
                <div className="sticky top-24 bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
                    {filterUI}
                </div>
            </aside>

            {/* Mobile Filter Button & Modal */}
            <div className="md:hidden mb-6">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="w-full bg-slate-800 border border-slate-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium"
                >
                    <Filter size={18} />
                    Filters
                    {(filters.grade || filters.location || filters.stack || filters.minSalary) && (
                        <span className="bg-violet-500 text-xs px-2 py-0.5 rounded-full">!</span>
                    )}
                </button>

                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="absolute right-0 top-0 bottom-0 w-80 bg-slate-950 border-l border-slate-800 p-6 overflow-y-auto"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Filters</h3>
                                    <button
                                        onClick={() => setIsMobileOpen(false)}
                                        className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                {filterUI}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default FilterSidebar;
