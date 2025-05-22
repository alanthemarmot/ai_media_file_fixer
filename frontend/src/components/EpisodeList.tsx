import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import type { TVEpisode } from '../api';

const DEFAULT_QUALITY = '1080p';

interface EpisodeListProps {
  episodes: TVEpisode[];
  seriesTitle: string;
  seasonNumber: number;
  quality?: string;
}

export default function EpisodeList({ episodes, seriesTitle, seasonNumber, quality = DEFAULT_QUALITY }: EpisodeListProps) {
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
      <h3 className="text-lg font-semibold mb-2">Episodes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {episodes.map((ep, idx) => (
          <div key={ep.episode_number} className="bg-gray-50 p-3 rounded border flex flex-col">
            <span className="font-medium mb-1">Ep {ep.episode_number}: {ep.name}</span>
            <code className="block bg-white p-2 rounded text-xs mb-2 select-all">
              {getFilename(ep)}
            </code>
            <button
              onClick={() => handleCopy(ep, idx)}
              className="flex items-center text-blue-600 hover:underline text-xs self-end"
            >
              {copiedIndex === idx ? <CheckIcon className="w-4 h-4 text-green-500 mr-1" /> : <ClipboardIcon className="w-4 h-4 mr-1" />}
              {copiedIndex === idx ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
