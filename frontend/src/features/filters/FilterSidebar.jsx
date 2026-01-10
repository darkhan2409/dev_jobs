import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Briefcase } from 'lucide-react';
import { cn } from '../../utils/cn';
import axiosClient from '../../api/axiosClient';

const FilterSidebar = ({ filters, onFilterChange }) => {
    const [metadata, setMetadata] = useState({ locations: [], grades: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const response = await axiosClient.get('/filters');
                setMetadata(response.data);
            } catch (error) {
                console.error("Failed to fetch filters metadata:", error);
                setError(true);
                // Fallback data if API fails or backend is down
                setMetadata({
                    locations: ['Almaty', 'Astana', 'Remote'],
                    grades: ['Junior', 'Middle', 'Senior', 'Team Lead']
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.location-filter-container')) {
                setShowLocationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleLocationSelect = (loc) => {
        handleInputChange('location', loc);
        setLocationSearch(loc);
        setShowLocationDropdown(false);
    };

    const handleGradeToggle = (grade) => {
        const newValue = filters.grade === grade ? '' : grade;
        handleInputChange('grade', newValue);
    };

    const handleClearAll = () => {
        onFilterChange({ search: '', min_salary: '', grade: '', location: '' });
        setLocationSearch('');
    };

    // Filter locations based on search
    const filteredLocations = metadata.locations.filter(loc =>
        loc.toLowerCase().includes(locationSearch.toLowerCase())
    );

    return (
        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-100 font-bold text-lg">
                    <Filter size={20} className="text-blue-400" />
                    <span>Filters</span>
                </div>
                <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                    Clear all
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    ⚠️ Failed to load filter options. Using defaults.
                </div>
            )}

            <div className="space-y-8">
                {/* Salary Filter */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-3">
                        Min Salary
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₸</span>
                        <input
                            type="number"
                            min="0"
                            value={filters.min_salary}
                            onChange={(e) => handleInputChange('min_salary', e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-8 pr-4 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* Grade Filter */}
                <div>
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-400">
                        <Briefcase size={16} />
                        <span>Grade</span>
                    </div>
                    <div className="space-y-2">
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                            </div>
                        ) : (
                            metadata.grades.map((grade) => (
                                <label key={grade} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                        filters.grade === grade
                                            ? "border-blue-500 bg-blue-500/20"
                                            : "border-slate-700 group-hover:border-slate-600"
                                    )}>
                                        {filters.grade === grade && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-sm transition-colors",
                                        filters.grade === grade ? "text-blue-400" : "text-slate-400 group-hover:text-slate-300"
                                    )}>
                                        {grade}
                                    </span>
                                    <input
                                        type="radio"
                                        name="grade"
                                        className="hidden"
                                        checked={filters.grade === grade}
                                        onChange={() => handleGradeToggle(grade)}
                                    />
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Location Filter */}
                <div className="location-filter-container">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-400">
                        <MapPin size={16} />
                        <span>Location</span>
                    </div>
                    {loading ? (
                        <div className="h-10 bg-slate-800 rounded-lg animate-pulse"></div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                value={locationSearch}
                                onChange={(e) => {
                                    setLocationSearch(e.target.value);
                                    setShowLocationDropdown(true);
                                    if (e.target.value === '') {
                                        handleInputChange('location', '');
                                    }
                                }}
                                onFocus={() => setShowLocationDropdown(true)}
                                placeholder="Search location..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
                            />
                            {showLocationDropdown && filteredLocations.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {filteredLocations.map((loc) => (
                                        <button
                                            key={loc}
                                            onClick={() => handleLocationSelect(loc)}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                                filters.location === loc
                                                    ? "bg-blue-500/10 text-blue-400"
                                                    : "text-slate-300 hover:bg-slate-800"
                                            )}
                                        >
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;
