import { useState } from 'react';
import type { SearchResult } from '../api';
import '../components/IconLink.css';

interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export default function ResultsList({ results, onSelect }: ResultsListProps) {
  const [activeTab, setActiveTab] = useState<'tv' | 'movies'>('tv');

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No results to display
      </div>
    );
  }

  const tvShows = results.filter(r => r.media_type === 'tv');
  const movies = results.filter(r => r.media_type === 'movie');

  const renderResultGrid = (mediaItems: SearchResult[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {mediaItems.map((result) => (
        <button
          key={`${result.media_type}-${result.id}`}
          onClick={() => onSelect(result)}
          className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {result.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w185${result.poster_path}`}
              alt={result.title}
              className="w-32 h-48 object-cover rounded mb-2"
            />
          )}
          <span className="font-medium text-center text-lg">{result.title}</span>
          <span className="text-sm text-gray-500">{result.year}</span>
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
            className={`w-1/2 py-3 px-4 font-medium text-md text-center rounded-tl-md ${
              activeTab === 'tv'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            TV Shows ({tvShows.length})
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`w-1/2 py-3 px-4 font-medium text-md text-center rounded-tr-md ${
              activeTab === 'movies'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Movies ({movies.length})
          </button>
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
      </div>
    </div>
  );
}
