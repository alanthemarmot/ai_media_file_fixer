import '../components/IconLink.css';
import { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { CastMember, CrewInfo } from '../api';

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
  seriesTitle?: string;
  seriesYear?: number;
  network?: string;
  genres?: string[];
  cast?: CastMember[];
  crew?: CrewInfo;
  onQualityChange?: (quality: '720p' | '1080p' | '2160p') => void;
  quality?: '720p' | '1080p' | '2160p';
  onPersonSelect?: (personId: number, personName: string) => void;
}

export default function SeasonList({ 
  seasons, 
  onSelect, 
  selectedSeason, 
  seriesTitle = '', 
  seriesYear,
  network = '',
  genres,
  cast,
  crew,
  onQualityChange,
  quality = '1080p',
  onPersonSelect
}: SeasonListProps) {
  const [copied, setCopied] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | '2160p'>(quality);
  
  useEffect(() => {
    if (quality !== selectedQuality) {
      setSelectedQuality(quality);
    }
  }, [quality]);
  
  if (!seasons.length) return null;
  
  const directoryName = `${seriesTitle} ${network ? `[${network}]` : ''}(${selectedQuality})`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(directoryName);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleQualityChange = (newQuality: '720p' | '1080p' | '2160p') => {
    setSelectedQuality(newQuality);
    if (onQualityChange) {
      onQualityChange(newQuality);
    }
  };
  return (
    <div className="space-y-4">
      {/* Media Details section - similar to movie display */}
      {seriesTitle && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Media Details</h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-900 dark:text-gray-100">
            <div className="space-y-2">
              <p>
                <span className="font-medium">Title:</span> {seriesTitle}
              </p>
              {seriesYear && (
                <p>
                  <span className="font-medium">Year:</span> {seriesYear}
                </p>
              )}
              {network && (
                <p>
                  <span className="font-medium">Network:</span> {network}
                </p>
              )}
              {genres && genres.length > 0 && (
                <p>
                  <span className="font-medium">Genres:</span> {genres.join(', ')}
                </p>
              )}
              {cast && cast.length > 0 && (
                <div>
                  <span className="font-medium">Cast:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {cast.map((actor) => (
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
              {(crew?.directors || crew?.composers) && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {crew?.directors && (
                    <>
                      <span className="font-medium">Director{(crew.directors.length > 1) ? 's' : ''}:</span>
                      {crew.directors.map((director) => (
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
                  {crew?.composers && (
                    <>
                      <span className="font-medium">Composer{(crew.composers.length > 1) ? 's' : ''}:</span>
                      {crew.composers.map((composer) => (
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
            </div>
          </div>
        </div>
      )}
      
      {seriesTitle && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Select quality format:</label>
            <div className="flex justify-center space-x-4">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-blue-600" 
                  name="quality" 
                  checked={selectedQuality === '720p'} 
                  onChange={() => handleQualityChange('720p')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">720p</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-blue-600" 
                  name="quality" 
                  checked={selectedQuality === '1080p'} 
                  onChange={() => handleQualityChange('1080p')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">1080p</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-blue-600" 
                  name="quality" 
                  checked={selectedQuality === '2160p'} 
                  onChange={() => handleQualityChange('2160p')}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">2160p</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated directory name:</h3>
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
          <div className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono text-sm text-gray-900 dark:text-gray-100">
            {directoryName}
          </div>
        </div>
      )}
        
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Select a Season</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {seasons.map((season) => (
            <button
              key={season.season_number}
              onClick={() => onSelect(season)}
              className={`flex flex-col items-center p-2 border rounded-lg shadow bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedSeason === season.season_number ? 'border-blue-500 ring-2 ring-blue-400' : 'border-gray-200 dark:border-gray-600'}`}
            >
              {season.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                  alt={season.name}
                  className="w-20 h-28 object-cover rounded mb-2 shadow bg-white"
                />
              ) : (
                <div className="w-20 h-28 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs">No Image</div>
              )}
              <span className="font-medium text-sm text-center text-gray-900 dark:text-gray-100">{season.name}</span>
              {season.episode_count !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{season.episode_count} episodes</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }
