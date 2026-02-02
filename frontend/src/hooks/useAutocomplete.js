import { useState, useMemo } from 'react';

/**
 * Hook for managing autocomplete logic
 * @param {Array} items - List of items to filter
 * @param {number} minChars - Minimum characters to trigger suggestions
 * @returns {Object} - Autocomplete state and handlers
 */
export const useAutocomplete = (items = [], minChars = 2) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = useMemo(() => {
        if (!query || query.length < minChars) return [];

        const lowerQuery = query.toLowerCase();
        return items.filter(item =>
            item.toLowerCase().includes(lowerQuery)
        ).slice(0, 5); // Limit to 5 suggestions
    }, [query, items, minChars]);

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setShowSuggestions(true);
    };

    const handleSelect = (item) => {
        setQuery(item);
        setShowSuggestions(false);
    };

    return {
        query,
        setQuery,
        handleInputChange,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        handleSelect
    };
};
