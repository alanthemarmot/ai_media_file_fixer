import type { SearchResult } from '../api';

interface ResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export default function ResultsList({ results, onSelect }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No results to display
      </div>
    );
  }

  const tvShows = results.filter(r => r.media_type === 'tv');
  const movies = results.filter(r => r.media_type === 'movie');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {tvShows.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">TV Shows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tvShows.map((result) => (
              <button
                key={`tv-${result.id}`}
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
        </div>
      )}
      {movies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Movies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {movies.map((result) => (
              <button
                key={`movie-${result.id}`}
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
        </div>
      )}
    </div>
  );
}
