import { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { TVEpisode } from '../api';
import '../components/IconLink.css';

const DEFAULT_QUALITY = '1080p';

interface EpisodeListProps {
  episodes: TVEpisode[];
  seriesTitle: string;
  seriesYear?: number;
  seasonNumber: number;
  quality?: '720p' | '1080p' | '2160p';
  selectedSeason?: {
    poster_path?: string;
  };
  moviePosterPath?: string;
  network?: string;
  onQualityChange?: (quality: '720p' | '1080p' | '2160p') => void;
}

export default function EpisodeList({ 
  episodes, 
  seriesTitle, 
  seriesYear,
  seasonNumber, 
  quality = DEFAULT_QUALITY as '1080p',
  selectedSeason, 
  moviePosterPath, 
  network,
  onQualityChange
}: EpisodeListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | '2160p'>(quality);

  useEffect(() => {
    setSelectedQuality(quality);
  }, [quality]);

  const handleQualityChange = (newQuality: '720p' | '1080p' | '2160p') => {
    setSelectedQuality(newQuality);
    if (onQualityChange) {
      onQualityChange(newQuality);
    }
  };

  const getFilename = (ep: TVEpisode) => {
    return `S${String(seasonNumber).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')} - ${ep.name} (${selectedQuality})`;
  };

  const handleCopy = async (ep: TVEpisode, idx: number) => {
    const filename = getFilename(ep);
    try {
      await navigator.clipboard.writeText(filename);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-4">
          {moviePosterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w154${moviePosterPath}`}
              alt={`${seriesTitle}${seasonNumber ? ` - Season ${seasonNumber}` : ''}`}
              className="w-20 h-28 object-cover rounded shadow bg-white"
            />
          ) : selectedSeason?.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w154${selectedSeason.poster_path}`}
              alt={`${seriesTitle} - Season ${seasonNumber}`}
              className="w-20 h-28 object-cover rounded shadow bg-white"
            />
          ) : (
            <div className="w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded shadow flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
              No Image
            </div>
          )}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              {seriesTitle} {seriesYear ? `[${seriesYear}]` : ''} {seasonNumber ? `- Season ${seasonNumber}` : ''}
            </h3>
            {network && (
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">{network}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
              <span className="ml-2 text-gray-900 dark:text-white">720p</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="quality"
                checked={selectedQuality === '1080p'}
                onChange={() => handleQualityChange('1080p')}
              />
              <span className="ml-2 text-gray-900 dark:text-white">1080p</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="quality"
                checked={selectedQuality === '2160p'}
                onChange={() => handleQualityChange('2160p')}
              />
              <span className="ml-2 text-gray-900 dark:text-white">2160p</span>
            </label>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Episodes</h3>
      <div className="flex flex-col gap-4">
        {episodes.map((ep, idx) => (
          <div key={ep.episode_number} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium mb-1 sm:mb-0 sm:mr-4 text-gray-900 dark:text-white">Ep {ep.episode_number}: {ep.name}</span>
              <code className="block bg-white dark:bg-gray-900 p-2 rounded text-xs mb-2 sm:mb-0 sm:mr-4 select-all text-gray-900 dark:text-gray-100">
                {getFilename(ep)}
              </code>
            </div>
            <button
              onClick={() => handleCopy(ep, idx)}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-xs self-end sm:self-auto sm:ml-auto transition-colors"
              style={{ minWidth: '70px' }}
            >
              {copiedIndex === idx ? <CheckIcon className="w-4 h-4 text-white mr-1" /> : <ClipboardIcon className="w-4 h-4 mr-1" />}
              {copiedIndex === idx ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
