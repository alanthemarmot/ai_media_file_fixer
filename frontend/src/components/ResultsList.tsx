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

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-4">Search Results</h2>
      <div className="divide-y divide-gray-200">
        {results.map((result) => (
          <button
            key={`${result.media_type}-${result.id}`}
            onClick={() => onSelect(result)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{result.title}</h3>
                <p className="text-sm text-gray-500">
                  {result.year} • {result.media_type === 'tv' ? 'TV Show' : 'Movie'}
                </p>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
