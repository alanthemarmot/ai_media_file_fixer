import '../components/IconLink.css';

interface TVSeason {
  season_number: number;
  name: string;
  poster_path?: string;
  episode_count?: number;
}

interface SeasonListProps {
  seasons: TVSeason[];
  onSelect: (season: TVSeason) => void;
  selectedSeason?: number;
}

export default function SeasonList({ seasons, onSelect, selectedSeason }: SeasonListProps) {
  if (!seasons.length) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-2">Select a Season</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {seasons.map((season) => (
          <button
            key={season.season_number}
            onClick={() => onSelect(season)}
            className={`flex flex-col items-center p-2 border rounded-lg shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedSeason === season.season_number ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-200'}`}
          >
            {season.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                alt={season.name}
                className="w-20 h-28 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-20 h-28 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">No Image</div>
            )}
            <span className="font-medium text-sm text-center">{season.name}</span>
            {season.episode_count !== undefined && (
              <span className="text-xs text-gray-500">{season.episode_count} episodes</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
