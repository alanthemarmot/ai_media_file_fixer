import { useState, useEffect } from 'react';
import { searchMedia, type SearchResult } from '../api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { hasApiKey } from '../services/apiKeyService';

interface SearchBarProps {
  onSearch: (results: SearchResult[]) => void;
  resetTrigger?: number;
  onReset?: () => void;
  hasResults?: boolean;
}

export default function SearchBar({ onSearch, resetTrigger = 0, onReset, hasResults = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  useEffect(() => {
    if (resetTrigger > 0) {
      setQuery('');
    }
  }, [resetTrigger]);
  
  useEffect(() => {
    // Check if API key is missing and show warning
    setShowApiKeyWarning(!hasApiKey());
  }, []);
  
  const handleReset = () => {
    setQuery('');
    if (onReset) {
      onReset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await searchMedia(query);
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
      let errorMessage = 'Search failed. Please try again.';
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key') || 
            error.message.includes('API key not found')) {
          errorMessage = 'Invalid or missing API key. Please provide a valid TMDB API key.';
        }
      }
      
      setError(errorMessage);
      onSearch([]); // Clear any previous results
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
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
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
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
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a movie or TV show..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
          />
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
