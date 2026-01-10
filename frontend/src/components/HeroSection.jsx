import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Terminal, MapPin, ArrowRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const HeroSection = ({ search, location, onSearchApply, filters, onFilterChange }) => {
    // Local state for inputs to prevent auto-filtering
    const [localSearch, setLocalSearch] = useState(search);
    const [localLocation, setLocalLocation] = useState(location || '');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [allLocations, setAllLocations] = useState([]);
    const locationInputRef = useRef(null);
    const locationDropdownRef = useRef(null);

    // Fetch locations from API
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axiosClient.get('/filters');
                setAllLocations(response.data.locations || []);
            } catch (error) {
                console.error('Failed to fetch locations:', error);
                // Fallback to some default locations
                setAllLocations(['Алматы', 'Астана', 'Шымкент', 'Remote']);
            }
        };
        fetchLocations();
    }, []);

    // Sync local state if props change externally (e.g. via URL)
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    useEffect(() => {
        setLocalLocation(filters.location || '');
    }, [filters.location]);

    // Click outside handler for location dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                locationDropdownRef.current &&
                !locationDropdownRef.current.contains(event.target) &&
                locationInputRef.current &&
                !locationInputRef.current.contains(event.target)
            ) {
                setShowLocationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = () => {
        onSearchApply({ search: localSearch, location: localLocation });
        setShowLocationDropdown(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handleGradeChange = (grade) => {
        onFilterChange({ ...filters, grade: filters.grade === grade ? '' : grade });
    };

    const grades = ['Junior', 'Middle', 'Senior', 'Team Lead'];
    const popularTech = ['Python', 'React', 'Go', 'Java', 'DevOps'];

    // Filter locations based on input
    const filteredLocations = localLocation
        ? allLocations.filter(loc =>
            loc.toLowerCase().includes(localLocation.toLowerCase())
        )
        : allLocations;

    const handleTechClick = (tech) => {
        const newSearch = tech;
        setLocalSearch(newSearch);
        onSearchApply({ search: newSearch, location: localLocation });
    };

    const handleLocationSelect = (loc) => {
        setLocalLocation(loc);
        setShowLocationDropdown(false);
        onSearchApply({ search: localSearch, location: loc });
    };

    return (
        <div className="relative overflow-hidden bg-slate-900 border-b border-slate-800 pb-12 pt-16">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: 'radial-gradient(#4c1d95 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-mono text-violet-400 mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                    </span>
                    v2.0.0-beta
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-slate-100 tracking-tight mb-4">
                    Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">commit</span>.
                </h1>

                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                    The open-source job board built for developers, by developers. <br className="hidden sm:block" />
                    No recruiters, no noise. Just code.
                </p>

                {/* Command Palette Search Box */}
                <div className="max-w-3xl mx-auto relative group flex flex-col md:flex-row gap-3">
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                    {/* Main Search Input */}
                    <div className="relative flex-grow flex items-center bg-slate-950 border border-slate-700 rounded-lg p-2 shadow-2xl">
                        <Terminal className="ml-3 text-slate-500" size={20} />
                        <span className="ml-2 text-violet-500 font-mono hidden sm:inline">$</span>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 font-mono py-2 px-3 focus:outline-none"
                            placeholder="grep 'keyword'"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Location Input with Dropdown */}
                    <div className="relative md:w-1/3">
                        <div
                            ref={locationInputRef}
                            className="relative flex items-center bg-slate-950 border border-slate-700 rounded-lg p-2 shadow-2xl"
                        >
                            <MapPin className="ml-3 text-slate-500" size={20} />
                            <input
                                type="text"
                                className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500 font-mono py-2 px-3 focus:outline-none"
                                placeholder="--location='...'"
                                value={localLocation}
                                onChange={(e) => {
                                    setLocalLocation(e.target.value);
                                    setShowLocationDropdown(true);
                                }}
                                onFocus={() => setShowLocationDropdown(true)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        {/* Dropdown */}
                        {showLocationDropdown && filteredLocations.length > 0 && (
                            <div
                                ref={locationDropdownRef}
                                className="absolute top-full mt-2 w-full bg-slate-950 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50"
                            >
                                {filteredLocations.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => handleLocationSelect(loc)}
                                        className="w-full text-left px-4 py-2 text-sm font-mono text-slate-300 hover:bg-slate-800 hover:text-violet-400 transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSearchSubmit}
                        className="relative hidden md:flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-lg font-mono transition-colors border border-violet-500/50"
                    >
                        <ArrowRight size={20} />
                    </button>
                </div>

                {/* Instructions / Hints */}
                <div className="mt-2 text-slate-500 text-xs font-mono mb-8 opacity-70">
                    Press <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Enter</span> to run search query
                </div>

                {/* Quick Filters */}
                <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                    {/* Grade Filters */}
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                        {grades.map(grade => (
                            <button
                                key={grade}
                                onClick={() => handleGradeChange(grade)}
                                className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all ${filters.grade === grade
                                    ? 'bg-violet-500/10 text-violet-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>

                    {/* Top Tech */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {popularTech.map(tech => (
                            <button
                                key={tech}
                                onClick={() => handleTechClick(tech)}
                                className="px-3 py-1.5 rounded-md bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-xs font-mono text-slate-300 transition-colors"
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
