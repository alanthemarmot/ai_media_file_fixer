import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import type { SearchResult } from '../api';
import PersonResultsList from './PersonResultsList';
import '../components/IconLink.css';

interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export default function ResultsList({ results, onSelect }: ResultsListProps) {
  const tvShows = results.filter(r => r.media_type === 'tv');
  const movies = results.filter(r => r.media_type === 'movie');
  const people = results.filter(r => r.media_type === 'person');

  // Determine default tab based on which category has results
  const getDefaultTab = (): 'tv' | 'movies' | 'people' => {
    if (tvShows.length > 0) return 'tv';
    if (movies.length > 0) return 'movies';
    if (people.length > 0) return 'people';
    return 'tv';
  };

  const [activeTab, setActiveTab] = useState<'tv' | 'movies' | 'people'>(getDefaultTab());

  // Update active tab when results change
  React.useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-16 min-h-[400px] flex items-center justify-center">
        <div className="space-y-4">
          <div className="text-xl font-light">No results to display</div>
          <div className="text-sm opacity-75">Search for movies, TV shows, or people to get started</div>
        </div>
      </div>
    );
  }

  const renderResultGrid = (mediaItems: SearchResult[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {mediaItems.map((result) => (
        <button
          key={`${result.media_type}-${result.id}`}
          onClick={() => onSelect(result)}
          className="flex flex-col items-center p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {result.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${result.poster_path}`}
              alt={result.title || result.name}
              className="w-32 h-48 object-cover rounded mb-2"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs">
              No Image
            </div>
          )}
          <span className="font-medium text-center text-lg text-gray-900 dark:text-gray-100">{result.title}</span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">{result.year}</span>
            {result.vote_average != null && result.vote_average > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <StarIcon className="w-4 h-4" />
                <span className="font-medium">{result.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="w-full">
        <nav className="flex w-full">
          <button
            onClick={() => setActiveTab('tv')}
            data-testid="tv-tab"
            className={`flex-1 py-3 px-4 font-medium text-md text-center ${
              activeTab === 'tv'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${people.length > 0 ? 'rounded-tl-md' : 'rounded-l-md'}`}
          >
            TV Shows ({tvShows.length})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            data-testid="movies-tab"
            className={`flex-1 py-3 px-4 font-medium text-md text-center ${
              activeTab === 'movies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${people.length === 0 ? 'rounded-r-md' : ''}`}
          >
            Movies ({movies.length})
          </button>
          {people.length > 0 && (
            <button
              onClick={() => setActiveTab('people')}
              className={`flex-1 py-3 px-4 font-medium text-md text-center rounded-tr-md ${
                activeTab === 'people'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              People ({people.length})
            </button>
          )}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'tv' && tvShows.length > 0 && (
          <div>
            {renderResultGrid(tvShows)}
          </div>
        )}
        
        {activeTab === 'movies' && movies.length > 0 && (
          <div>
            {renderResultGrid(movies)}
          </div>
        )}
        
        {activeTab === 'people' && people.length > 0 && (
          <PersonResultsList results={people} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
