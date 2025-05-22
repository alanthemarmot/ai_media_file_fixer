import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { TVEpisode } from '../api';
import '../components/IconLink.css';

const DEFAULT_QUALITY = '1080p';

interface EpisodeListProps {
  episodes: TVEpisode[];
  seriesTitle: string;
  seasonNumber: number;
  quality?: string;
  selectedSeason?: {
    poster_path?: string;
  };
  moviePosterPath?: string;
  network?: string;
}

export default function EpisodeList({ episodes, seriesTitle, seasonNumber, quality = DEFAULT_QUALITY, selectedSeason, moviePosterPath, network }: EpisodeListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getFilename = (ep: TVEpisode) => {
    return `S${String(seasonNumber).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')} - ${ep.name} (${quality})`;
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
          {moviePosterPath && (
            <img
              src={`https://image.tmdb.org/t/p/w154${moviePosterPath}`}
              alt={`${seriesTitle}${seasonNumber ? ` - Season ${seasonNumber}` : ''}`}
              className="w-20 h-28 object-cover rounded shadow"
            />
          )}
          {!moviePosterPath && selectedSeason?.poster_path && (
            <img
              src={`https://image.tmdb.org/t/p/w154${selectedSeason.poster_path}`}
              alt={`${seriesTitle} - Season ${seasonNumber}`}
              className="w-20 h-28 object-cover rounded shadow"
            />
          )}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-center">
              {seriesTitle} {seasonNumber ? `- Season ${seasonNumber}` : ''}
            </h3>
            {network && (
              <span className="text-sm text-gray-500 font-medium mt-1">{network}</span>
            )}
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Episodes</h3>
      <div className="flex flex-col gap-4">
        {episodes.map((ep, idx) => (
          <div key={ep.episode_number} className="bg-gray-50 p-3 rounded border flex flex-col sm:flex-row sm:items-center">
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
              <span className="font-medium mb-1 sm:mb-0 sm:mr-4">Ep {ep.episode_number}: {ep.name}</span>
              <code className="block bg-white p-2 rounded text-xs mb-2 sm:mb-0 sm:mr-4 select-all">
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
