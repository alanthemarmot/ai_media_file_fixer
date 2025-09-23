import { useState, useEffect, useRef, useCallback } from 'react';
import { searchMedia, type SearchResult } from '../api';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { hasApiKey, checkServerApiKey } from '../services/apiKeyService';
import Fuse from 'fuse.js';

interface EnhancedSearchBarProps {
  onSearch: (results: SearchResult[]) => void;
  resetTrigger?: number;
  onReset?: () => void;
  hasResults?: boolean;
}

export default function EnhancedSearchBar({ 
  onSearch, 
  resetTrigger = 0, 
  onReset, 
  hasResults = false 
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionTimeoutRef = useRef<number | null>(null);

  // Fuse.js configuration for fuzzy matching
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'name', weight: 0.7 },
      { name: 'known_for_department', weight: 0.3 }
    ],
    threshold: 0.4, // Lower = more strict, Higher = more fuzzy
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  };

  useEffect(() => {
    if (resetTrigger > 0) {
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [resetTrigger]);

  useEffect(() => {
    const checkApiKey = async () => {
      const hasLocalKey = hasApiKey();
      const hasServerKey = await checkServerApiKey();
      setShowApiKeyWarning(!hasLocalKey && !hasServerKey);
    };
    checkApiKey();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReset = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onReset) {
      onReset();
    }
  };

  // Debounced search for suggestions
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchMedia(searchQuery);
      
      // If we have results, enhance them with fuzzy matching
      if (results.length > 0) {
        const fuse = new Fuse(results, fuseOptions);
        const fuzzyResults = fuse.search(searchQuery);
        
        // Combine original results with fuzzy matching scores
        const enhancedResults = fuzzyResults.length > 0 
          ? fuzzyResults.map(result => result.item)
          : results;

        setSuggestions(enhancedResults.slice(0, 8)); // Limit to 8 suggestions
      } else {
        // If no exact results, try with simplified query (remove special chars, etc.)
        const simplifiedQuery = searchQuery.replace(/[^a-zA-Z0-9\s]/g, '').trim();
        if (simplifiedQuery !== searchQuery && simplifiedQuery.length > 2) {
          const fallbackResults = await searchMedia(simplifiedQuery);
          setSuggestions(fallbackResults.slice(0, 5));
        } else {
          setSuggestions([]);
        }
      }
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      console.error('Suggestion search failed:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timeout
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    // Set new timeout for debounced search
    suggestionTimeoutRef.current = window.setTimeout(() => {
      debouncedSearch(value);
    }, 300); // 300ms delay
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionSelect = async (suggestion: SearchResult) => {
    const suggestionText = suggestion.title || suggestion.name || '';
    setQuery(suggestionText);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Perform full search with selected suggestion
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchMedia(suggestionText);
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
      onSearch([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await searchMedia(query);
      
      // Enhanced search: if we get few results, try fuzzy matching
      if (results.length < 3 && query.length > 3) {
        // Try searching with common variations
        const variations = [
          query.replace(/[^a-zA-Z0-9\s]/g, ''), // Remove special chars
          query.split(' ').slice(0, -1).join(' '), // Remove last word
          query.replace(/\s+/g, ' '), // Normalize spaces
        ].filter(v => v.length > 2 && v !== query);

        for (const variation of variations) {
          try {
            const additionalResults = await searchMedia(variation);
            if (additionalResults.length > 0) {
              // Merge and deduplicate results
              const combined = [...results];
              additionalResults.forEach(newItem => {
                if (!combined.find(item => item.id === newItem.id && item.media_type === newItem.media_type)) {
                  combined.push(newItem);
                }
              });
              onSearch(combined);
              return;
            }
          } catch {
            // Continue to next variation
          }
        }
      }
      
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
      let errorMessage = 'Search failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key') || 
            error.message.includes('API key not found')) {
          errorMessage = 'Invalid or missing API key. Please provide a valid TMDB API key.';
        }
      }
      
      setError(errorMessage);
      onSearch([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionDisplayText = (suggestion: SearchResult) => {
    const name = suggestion.title || suggestion.name || '';
    const year = suggestion.year ? ` (${suggestion.year})` : '';
    const type = suggestion.media_type === 'person' 
      ? ` • ${suggestion.known_for_department || 'Person'}` 
      : ` • ${suggestion.media_type === 'tv' ? 'TV Show' : 'Movie'}`;
    return `${name}${year}${type}`;
  };

  return (
    <div ref={searchRef} className="relative">
      {hasResults && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-1" /> Clear search
          </button>
        </div>
      )}
      
      {showApiKeyWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> No API key detected. Your searches may not work.
                You can set your API key in the setup screen.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder="Search for movies, TV shows, or people..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="off"
            />
            
            {/* Search suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-64 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.media_type}-${suggestion.id}`}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none transition-colors text-gray-900 dark:text-gray-100 ${
                      index === selectedSuggestionIndex ? 'bg-blue-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {getSuggestionDisplayText(suggestion)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Loading indicator for suggestions */}
            {isSearching && query.length > 1 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}
      </form>
    </div>
  );
}
