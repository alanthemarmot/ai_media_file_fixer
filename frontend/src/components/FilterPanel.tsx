import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getGenres, type Genre, type FilterOptions } from '../api';

interface FilterPanelProps {
  mediaType: 'movie' | 'tv' | 'all';
  onFiltersChange: (filters: FilterOptions, mediaType: 'movie' | 'tv') => void;
  onClearFilters: () => void;
}

export default function FilterPanel({ mediaType, onFiltersChange, onClearFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<'movie' | 'tv'>('tv');
  const [timeFilter, setTimeFilter] = useState<'new' | 'old'>('new');
  const [isRandomizing, setIsRandomizing] = useState(false);

  // Load genres when media type changes or panel is expanded
  useEffect(() => {
    if (isExpanded) {
      const typeToLoad = mediaType === 'all' ? activeFilterType : mediaType;
      loadGenres(typeToLoad);
      if (mediaType !== 'all') {
        setActiveFilterType(mediaType);
      }
    }
  }, [isExpanded, mediaType]);

  const loadGenres = async (type: 'movie' | 'tv') => {
    try {
      const genreList = await getGenres(type);
      setGenres(genreList);
    } catch (error) {
      console.error('Failed to load genres:', error);
      setGenres([]);
    }
  };

  const handleMediaTypeChange = async (type: 'movie' | 'tv') => {
    setActiveFilterType(type);
    await loadGenres(type);
    // Clear genre selection when switching
    setSelectedGenre(null);
  };

  const handleRandomize = async () => {
    setIsRandomizing(true);

    try {
      const filters: FilterOptions = {};

      // Add genre filter if selected
      if (selectedGenre) {
        filters.with_genres = selectedGenre.toString();
      }

      // Add year filter based on New/Old selection
      const currentYear = new Date().getFullYear();
      if (timeFilter === 'new') {
        // Current year only
        if (activeFilterType === 'movie') {
          filters.primary_release_year = currentYear;
        } else {
          filters.first_air_date_year = currentYear;
        }
      } else {
        // Old - pick a random year between 1980 and current year - 1
        const minYear = 1980;
        const maxYear = currentYear - 1;
        const randomYear = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;

        if (activeFilterType === 'movie') {
          filters.primary_release_year = randomYear;
        } else {
          filters.first_air_date_year = randomYear;
        }
      }

      // Sort by popularity to get good results
      filters.sort_by = 'popularity.desc';

      // Get results and randomly select 10
      onFiltersChange(filters, activeFilterType);
    } catch (error) {
      console.error('Randomization failed:', error);
    } finally {
      setIsRandomizing(false);
    }
  };

  return (
    <div className="mb-4">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
        <SparklesIcon className="w-5 h-5" />
        <span className="font-medium">Randomizer</span>
      </button>

      {/* Randomizer panel */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get 10 random {activeFilterType === 'movie' ? 'movies' : 'TV shows'} based on your preferences
          </div>

          {/* Media type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
              Type
            </label>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleMediaTypeChange('tv')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeFilterType === 'tv'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                TV Shows
              </button>
              <button
                onClick={() => handleMediaTypeChange('movie')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeFilterType === 'movie'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Movies
              </button>
            </div>
          </div>

          {/* Genre selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Genre (optional)
            </label>
            <select
              value={selectedGenre || ''}
              onChange={(e) => setSelectedGenre(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Any Genre</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Release Period
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeFilter('new')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  timeFilter === 'new'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                New (This Year)
              </button>
              <button
                onClick={() => setTimeFilter('old')}
                className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                  timeFilter === 'old'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Old (Before {new Date().getFullYear()})
              </button>
            </div>
          </div>

          {/* Randomize button */}
          <button
            onClick={handleRandomize}
            disabled={isRandomizing}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            <SparklesIcon className="w-5 h-5" />
            {isRandomizing ? 'Getting Random Results...' : 'Get Random'}
          </button>
        </div>
      )}
    </div>
  );
}
