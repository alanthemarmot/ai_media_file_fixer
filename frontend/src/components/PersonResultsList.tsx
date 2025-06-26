import type { SearchResult } from '../api';

interface PersonResultsListProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

export default function PersonResultsList({ results, onSelect }: PersonResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No people found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((result) => (
        <button
          key={`person-${result.id}`}
          onClick={() => onSelect(result)}
          className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {result.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${result.profile_path}`}
              alt={result.name}
              className="w-32 h-48 object-cover rounded mb-2"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
              No Photo
            </div>
          )}
          <span className="font-medium text-center text-lg">{result.name}</span>
          {result.known_for_department && (
            <span className="text-sm text-blue-600">{result.known_for_department}</span>
          )}
        </button>
      ))}
    </div>
  );
}
