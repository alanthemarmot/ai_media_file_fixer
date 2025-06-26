import { useState, useRef, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import ResultsList from './components/ResultsList'
import DisplayArea from './components/DisplayArea'
import SeasonList from './components/SeasonList'
import EpisodeList from './components/EpisodeList';
import Breadcrumb from './components/Breadcrumb';
import ApiKeySetup from './components/ApiKeySetup';
import SettingsModal from './components/SettingsModal';
import type { BreadcrumbItem } from './components/Breadcrumb';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import './App.css'
import './components/IconLink.css'
import { getTVSeasons, getTVEpisodes, getMediaDetails, checkServerApiKeyStatus } from './api';
import { hasApiKey } from './services/apiKeyService';

function App() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null)
  const [view, setView] = useState<'results' | 'seasons' | 'details' | 'episodes'>('results')
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [quality, setQuality] = useState<'720p' | '1080p' | '2160p'>('1080p');
  const [resetSearchCounter, setResetSearchCounter] = useState(0);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'missing' | 'present'>('checking');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Check if API key exists on component mount
  useEffect(() => {
    const checkApiKeyStatus = async () => {
      // First check if server has an API key
      const serverHasKey = await checkServerApiKeyStatus();
      
      if (serverHasKey) {
        // Server has key, no need for user to provide one
        setApiKeyStatus('present');
      } else {
        // Server doesn't have key, check if user has provided one locally
        const userHasKey = hasApiKey();
        setApiKeyStatus(userHasKey ? 'present' : 'missing');
      }
    };
    
    checkApiKeyStatus();
  }, []);

  const handleQualityChange = (newQuality: '720p' | '1080p' | '2160p') => {
    setQuality(newQuality);
  };

  const handleSearch = (results: any[]) => {
    setSearchResults(results)
    setSelectedItem(null)
    setSeasons([])
    setSelectedSeason(null)
    setView('results')
  }
  
  const resetSearch = () => {
    setSearchResults([])
    setSelectedItem(null)
    setSeasons([])
    setSelectedSeason(null)
    setView('results')
    setResetSearchCounter(prev => prev + 1)
  }

  const handleSelect = async (item: any) => {
    setSelectedItem(item);
    setSelectedSeason(null);
    if (item.media_type === 'tv') {
      setView('seasons');
      try {
        const s = await getTVSeasons(item.id);
        setSeasons(s);
        
        // Try to get the network information
        try {
          const details = await getMediaDetails(item.id, 'tv');
          if ('network' in details) {
            // Update the selectedItem with network info
            setSelectedItem({
              ...item,
              network: details.network
            });
          }
        } catch (networkError) {
          console.error('Error fetching network details:', networkError);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    } else {
      setSeasons([]);
      setView('details');
    }
  }

  // Add a function to go back to seasons view
  const goToSeasons = () => {
    if (selectedItem?.media_type === 'tv') {
      setSelectedSeason(null);
      setView('seasons');
    }
  };

  const handleSeasonSelect = async (season: any) => {
    setSelectedSeason(season);
    setView('episodes');
    setEpisodes([]);
    setLoadingEpisodes(true);
    try {
      const eps = await getTVEpisodes(selectedItem.id, season.season_number);
      setEpisodes(eps);
    } catch (e) {
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  // Function to generate breadcrumb items based on the current view
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { 
        label: 'Home',
        onClick: resetSearch 
      }
    ];
    
    // Add "Search Results" for results page and all subsequent pages
    if ((searchResults.length > 0) && (view === 'results' || selectedItem)) {
      items.push({
        label: 'Search Results',
        onClick: view !== 'results' ? () => {
          setSelectedItem(null);
          setSelectedSeason(null);
          setView('results');
        } : undefined
      });
    }
    
    // For pages with a selected item
    if (selectedItem) {
      items.push({
        label: selectedItem.title,
        onClick: selectedItem.media_type === 'tv' && view === 'episodes' ? goToSeasons : undefined
      });
      
      if (view === 'episodes' && selectedSeason) {
        items.push({
          label: `Season ${selectedSeason.season_number}`,
        });
      }
    }
    
    return items;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center">
      {apiKeyStatus === 'missing' ? (
        <ApiKeySetup 
          onComplete={() => setApiKeyStatus('present')}
          onSkip={() => setApiKeyStatus('present')}
        />
      ) : apiKeyStatus === 'checking' ? (
        <div className="flex justify-center items-center h-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="relative py-3 max-w-7xl mx-auto w-full">
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 overflow-x-hidden" ref={mainContentRef}>
            <div className="max-w-6xl mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <img 
                        src="/mfr_icon.png" 
                        alt="Media File Renamer" 
                        className="h-10 w-10 mr-3 cursor-pointer icon-link" 
                        onClick={resetSearch}
                      />
                      <h1 className="text-3xl font-bold">Media File Renamer</h1>
                    </div>
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                      title="Settings"
                    >
                      <Cog6ToothIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  
                  {/* Breadcrumb navigation - now shown on all pages */}
                  <Breadcrumb items={getBreadcrumbItems()} />
                  
                  {/* Show SearchBar only on home/results page */}
                  {view === 'results' && (
                    <SearchBar 
                      onSearch={handleSearch} 
                      resetTrigger={resetSearchCounter} 
                      onReset={resetSearch} 
                      hasResults={searchResults.length > 0} 
                    />
                  )}
                  
                  <div className="mt-8 min-h-[400px]">
                    {view === 'results' && (
                      <ResultsList results={searchResults} onSelect={handleSelect} />
                    )}
                    {view === 'seasons' && selectedItem && selectedItem.media_type === 'tv' && (
                      <div className="flex flex-col min-h-[400px] h-full">
                        <div className="flex-1">
                          <SeasonList
                            seasons={seasons}
                            onSelect={handleSeasonSelect}
                            selectedSeason={selectedSeason?.season_number}
                            seriesTitle={selectedItem.title}
                            seriesYear={selectedItem.year}
                            network={selectedItem.network}
                            quality={quality}
                            onQualityChange={handleQualityChange}
                          />
                        </div>
                      </div>
                    )}
                    {view === 'episodes' && selectedItem && selectedSeason && (
                      <div className="flex flex-col min-h-[400px] h-full">
                        <div className="flex-1">
                          {loadingEpisodes ? (
                            <div className="text-center text-gray-500 py-4">Loading episodes...</div>
                          ) : episodes.length > 0 ? (
                            <EpisodeList
                              episodes={episodes}
                              seriesTitle={selectedItem.title}
                              seriesYear={selectedItem.year}
                              seasonNumber={selectedSeason.season_number}
                              quality={quality}
                              selectedSeason={selectedSeason}
                              moviePosterPath={selectedItem.poster_path}
                              network={selectedItem.network}
                              onQualityChange={handleQualityChange}
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-4">No episodes found</div>
                          )}
                        </div>
                      </div>
                    )}
                    {view === 'episodes' && selectedItem && !selectedSeason && (
                      <div className="text-center text-gray-500 py-4">Loading season information...</div>
                    )}
                    {view === 'details' && selectedItem && (
                      <div className="flex flex-col min-h-[400px] h-full">
                        <div className="flex-1">
                          <DisplayArea selectedItem={selectedItem} quality={quality} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Modal */}
          <SettingsModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            onApiKeySaved={() => {
              // Refresh the API key status
              setApiKeyStatus(hasApiKey() ? 'present' : 'missing');
            }}
          />
        </div>
      )}
    </div>
  )
}

export default App
