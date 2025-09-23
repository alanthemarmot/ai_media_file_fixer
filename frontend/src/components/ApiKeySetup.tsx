import { useState } from 'react';
import { saveApiKey } from '../services/apiKeyService';
import { validateApiKey } from '../api';
import mfrIcon from '../../images/mfr_icon.png';

interface ApiKeySetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function ApiKeySetup({ onComplete, onSkip }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate the API key
      const isValid = await validateApiKey(apiKey.trim());
      
      if (!isValid) {
        setError('Invalid API key. Please check and try again.');
        setIsLoading(false);
        return;
      }
      
      // Save the API key if valid
      saveApiKey(apiKey.trim());
      
      // Notify the parent component that setup is complete
      onComplete();
    } catch (error) {
      console.error('Failed to validate API key:', error);
      setError('Failed to validate API key. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-center mb-6">
        <img 
          src={mfrIcon}
          alt="Media File Renamer" 
          className="h-10 w-10 mr-3" 
        />
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">Media File Renamer</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">API Key Setup</h2>
        
        <p className="mb-6 text-center text-gray-700 dark:text-gray-300">
          This application requires a free API key from The Movie Database (TMDB) to search for movies and TV shows.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6 flex justify-center">
          <div className="w-full max-w-md">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 text-center">How to get a TMDB API key:</h3>
            <ol className="mt-2 text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1 text-center">
              <li>Visit <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900 dark:hover:text-blue-100">themoviedb.org</a> and create a free account</li>
              <li>Go to your account settings → API</li>
              <li>Request an API key for personal use</li>
              <li>Copy your API key and paste it below</li>
            </ol>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter your TMDB API key:
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex justify-between">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Continue without API key
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ml-auto"
            >
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Your API key is stored locally on your device and is never sent to our servers.
      </p>
    </div>
  );
}
