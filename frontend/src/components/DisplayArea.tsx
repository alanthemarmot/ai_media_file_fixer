import { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { type SearchResult, type MediaDetails, getMediaDetails } from '../api';

interface DisplayAreaProps {
  selectedItem: SearchResult | null;
  quality?: string;
}

export default function DisplayArea({ selectedItem, quality = '1080p' }: DisplayAreaProps) {
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedItem) {
      setDetails(null);
      setError(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mediaDetails = await getMediaDetails(selectedItem.id, selectedItem.media_type);
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

  const getFileName = () => {
    if (!details) return '';
    if ('episode' in details) {
      // TV Show
      return `S${String(details.season).padStart(2, '0')}E${String(details.episode).padStart(2, '0')} - ${details.episode_title} (${quality})`;
    } else {
      // Movie
      return `${details.title} [${details.year}] (${quality})`;
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
      <div className="text-center text-gray-500 py-8">
        Select an item to see details
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-8">
        Loading details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Media Details</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
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
            <div className="mt-4">
              <p className="font-medium">Suggested filename:</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                {`${details.title} - S${details.season.toString().padStart(2, '0')}E${details.episode
                  .toString()
                  .padStart(2, '0')} - ${details.episode_title} (${quality})`}
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
            <div className="mt-4">
              <p className="font-medium">Suggested filename:</p>
              <code className="block bg-gray-100 p-2 rounded mt-1">
                {`${details.title} (${details.year})`}
              </code>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Generated filename:</h3>
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
        >
          {copied ? (
            <CheckIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ClipboardIcon className="w-5 h-5" />
          )}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="mt-2 p-3 bg-white rounded border border-gray-200 font-mono text-sm">
        {fileName}
      </div>
    </div>
  );
}
