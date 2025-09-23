import { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { type SearchResult, type MediaDetails, getMediaDetails } from '../api';

interface DisplayAreaProps {
  selectedItem: SearchResult | null;
  quality?: string;
  onPersonSelect?: (personId: number, personName: string) => void;
}

export default function DisplayArea({ selectedItem, quality = '1080p', onPersonSelect }: DisplayAreaProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Add local quality state for movies
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | '2160p'>(quality as any || '1080p');

  useEffect(() => {
    if (!selectedItem) {
      setDetails(null);
      setError(null);
      return;
    }

    // Only fetch details for movies and TV shows, not people
    if (selectedItem.media_type === 'person') {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mediaDetails = await getMediaDetails(selectedItem.id, selectedItem.media_type as 'movie' | 'tv');
        setDetails(mediaDetails);
      } catch (err) {
        setError('Failed to load media details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [selectedItem]);

  useEffect(() => {
    setSelectedQuality(quality as any);
  }, [quality]);

  const handleQualityChange = (q: '720p' | '1080p' | '2160p') => {
    setSelectedQuality(q);
  };

  const getFileName = () => {
    if (!details) return '';
    if ('episode' in details) {
      // TV Show
      return `S${String(details.season).padStart(2, '0')}E${String(details.episode).padStart(2, '0')} - ${details.episode_title} (${selectedQuality})`;
    } else {
      // Movie
      return `${details.title} [${details.year}](${selectedQuality})`;
    }
  };

  const fileName = getFileName();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fileName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!selectedItem) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Select an item to see details
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 py-8">
        {error}
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Display poster and title at the top */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-4">
          {selectedItem.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w154${selectedItem.poster_path}`}
              alt={details ? details.title : selectedItem.title}
              className="w-24 h-36 object-cover rounded shadow"
            />
          )}
          <div className="flex items-center">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
              {details ? details.title : selectedItem.title} {!('episode_title' in details) && details.year ? `[${details.year}]` : ''}
            </h2>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Media Details</h2>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-900 dark:text-gray-100">
        {'episode_title' in details ? (
          // TV Show details
          <div className="space-y-2">
            <p>
              <span className="font-medium">Series:</span> {details.title}
            </p>
            <p>
              <span className="font-medium">Network:</span> {details.network}
            </p>
            <p>
              <span className="font-medium">Episode:</span> S{details.season.toString().padStart(2, '0')}E
              {details.episode.toString().padStart(2, '0')} - {details.episode_title}
            </p>
            {details.genres && details.genres.length > 0 && (
              <p>
                <span className="font-medium">Genres:</span> {details.genres.join(', ')}
              </p>
            )}
            {details.cast && details.cast.length > 0 && (
              <div>
                <span className="font-medium">Cast:</span>
                <div className="flex flex-wrap gap-2 mt-1 justify-center">
                  {details.cast.map((actor) => (
                    <button
                      key={actor.id}
                      onClick={() => onPersonSelect?.(actor.id, actor.name)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      title={actor.character ? `as ${actor.character}` : undefined}
                    >
                      {actor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(details.crew?.directors || details.crew?.composers) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {details.crew?.directors && (
                  <>
                    <span className="font-medium">Director{(details.crew.directors.length > 1) ? 's' : ''}:</span>
                    {details.crew.directors.map((director) => (
                      <button
                        key={`director-${director.id}`}
                        onClick={() => onPersonSelect?.(director.id, director.name)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      >
                        {director.name}
                      </button>
                    ))}
                  </>
                )}
                {details.crew?.composers && (
                  <>
                    <span className="font-medium">Composer{(details.crew.composers.length > 1) ? 's' : ''}:</span>
                    {details.crew.composers.map((composer) => (
                      <button
                        key={`composer-${composer.id}`}
                        onClick={() => onPersonSelect?.(composer.id, composer.name)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      >
                        {composer.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
            <div className="mt-4">
              <p className="font-medium">Suggested filename:</p>
              <code className="block bg-gray-100 dark:bg-gray-600 dark:text-gray-100 p-2 rounded mt-1">
                {`${details.title} - S${details.season.toString().padStart(2, '0')}E${details.episode
                  .toString()
                  .padStart(2, '0')} - ${details.episode_title} (${selectedQuality})`}
              </code>
            </div>
          </div>
        ) : (
          // Movie details
          <div className="space-y-2">
            <p>
              <span className="font-medium">Title:</span> {details.title}
            </p>
            <p>
              <span className="font-medium">Year:</span> {details.year}
            </p>
            {details.genres && details.genres.length > 0 && (
              <p>
                <span className="font-medium">Genres:</span> {details.genres.join(', ')}
              </p>
            )}
            {details.cast && details.cast.length > 0 && (
              <div>
                <span className="font-medium">Cast:</span>
                <div className="flex flex-wrap gap-2 mt-1 justify-center">
                  {details.cast.map((actor) => (
                    <button
                      key={actor.id}
                      onClick={() => onPersonSelect?.(actor.id, actor.name)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      title={actor.character ? `as ${actor.character}` : undefined}
                    >
                      {actor.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(details.crew?.directors || details.crew?.composers) && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {details.crew?.directors && (
                  <>
                    <span className="font-medium">Director{(details.crew.directors.length > 1) ? 's' : ''}:</span>
                    {details.crew.directors.map((director) => (
                      <button
                        key={`director-${director.id}`}
                        onClick={() => onPersonSelect?.(director.id, director.name)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      >
                        {director.name}
                      </button>
                    ))}
                  </>
                )}
                {details.crew?.composers && (
                  <>
                    <span className="font-medium">Composer{(details.crew.composers.length > 1) ? 's' : ''}:</span>
                    {details.crew.composers.map((composer) => (
                      <button
                        key={`composer-${composer.id}`}
                        onClick={() => onPersonSelect?.(composer.id, composer.name)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-2 py-1 rounded transition-colors"
                      >
                        {composer.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
            {/* Quality selector for movies */}
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Select quality format:</label>
              <div className="flex justify-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="movie-quality"
                    checked={selectedQuality === '720p'}
                    onChange={() => handleQualityChange('720p')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">720p</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="movie-quality"
                    checked={selectedQuality === '1080p'}
                    onChange={() => handleQualityChange('1080p')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">1080p</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-blue-600"
                    name="movie-quality"
                    checked={selectedQuality === '2160p'}
                    onChange={() => handleQualityChange('2160p')}
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">2160p</span>
                </label>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium">Suggested filename:</p>
              <code className="block bg-gray-100 dark:bg-gray-600 dark:text-gray-100 p-2 rounded mt-1">
                {`${details.title} [${details.year}](${selectedQuality})`}
              </code>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated filename:</h3>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 text-white" />
          ) : (
            <ClipboardIcon className="w-5 h-5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="mt-2 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm text-gray-900 dark:text-gray-100">
        {fileName}
      </div>
    </div>
  );
}
