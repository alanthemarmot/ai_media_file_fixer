import { useState, useRef, useEffect } from 'react'
import EnhancedSearchBar from './components/EnhancedSearchBar'
import ResultsList from './components/ResultsList'
import DisplayArea from './components/DisplayArea'
import SeasonList from './components/SeasonList'
import EpisodeList from './components/EpisodeList';
import Filmography from './components/Filmography';
import Breadcrumb from './components/Breadcrumb';
import ApiKeySetup from './components/ApiKeySetup';
import SettingsModal from './components/SettingsModal';
import ThemeToggle from './components/ThemeToggle';
import BulkRenamePanel from './components/BulkRenamePanel';
import { useFileRename } from './hooks/useFileRename';
import type { BreadcrumbItem } from './components/Breadcrumb';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import './App.css'
import './components/IconLink.css'
import mfrIcon from '../images/mfr_icon.png'
import { getTVSeasons, getTVEpisodes, getMediaDetails, checkServerApiKeyStatus, getPersonFilmography, type FilmographyItem, type PersonFilmography } from './api';
import { hasApiKey } from './services/apiKeyService';

function App() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null)
  const [view, setView] = useState<'results' | 'seasons' | 'details' | 'episodes' | 'filmography'>('results')
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [quality, setQuality] = useState<'720p' | '1080p' | '2160p'>('1080p');
  const [resetSearchCounter, setResetSearchCounter] = useState(0);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'missing' | 'present'>('checking');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [personFilmography, setPersonFilmography] = useState<PersonFilmography | null>(null);
  const [loadingFilmography, setLoadingFilmography] = useState(false);
  const [personContext, setPersonContext] = useState<any | null>(null); // Track person when viewing items from their filmography
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Bulk file rename functionality
  const { selectedFiles, isRenaming, addFile, removeFile, clearAllFiles, updateFileName, renameAllFiles } = useFileRename();
  
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
    setPersonFilmography(null)
    setPersonContext(null)
    setView('results')
    setResetSearchCounter(prev => prev + 1)
  }

  const handleSelect = async (item: any) => {
    setSelectedItem(item);
    setSelectedSeason(null);
    setPersonFilmography(null);
    
    // Clear person context when selecting directly (not from filmography)
    if (item.media_type === 'person') {
      setPersonContext(null);
    }
    
    if (item.media_type === 'person') {
      setView('filmography');
      setLoadingFilmography(true);
      try {
        const filmography = await getPersonFilmography(item.id);
        setPersonFilmography(filmography);
      } catch (error) {
        console.error('Error fetching filmography:', error);
        setPersonFilmography(null);
      } finally {
        setLoadingFilmography(false);
      }
    } else if (item.media_type === 'tv') {
      setView('seasons');
      try {
        const s = await getTVSeasons(item.id);
        setSeasons(s);
        
        // Try to get the network information
        try {
          const details = await getMediaDetails(item.id, 'tv');
          if ('network' in details) {
            // Update the selectedItem with network info and cast/crew details
            setSelectedItem({
              ...item,
              network: details.network,
              genres: details.genres,
              cast: details.cast,
              crew: details.crew
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

  // Function to handle selecting a filmography item (movie/TV show from person's filmography)
  const handleFilmographyItemSelect = async (item: FilmographyItem) => {
    // Set the person context so we can navigate back
    if (selectedItem && selectedItem.media_type === 'person') {
      setPersonContext(selectedItem);
    }
    
    // Convert filmography item to a search result format
    const searchResultItem = {
      id: item.id,
      media_type: item.media_type,
      title: item.title,
      year: item.year,
      poster_path: item.poster_path
    };
    
    // Handle selection like a regular search result
    await handleSelect(searchResultItem);
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
          setPersonFilmography(null);
          setPersonContext(null);
          setView('results');
        } : undefined
      });
    }
    
    // Add person context if we came from a person's filmography
    if (personContext && view !== 'filmography') {
      items.push({
        label: personContext.name,
        onClick: async () => {
          setSelectedItem(personContext);
          setSelectedSeason(null);
          setView('filmography');
          setLoadingFilmography(true);
          try {
            const filmography = await getPersonFilmography(personContext.id);
            setPersonFilmography(filmography);
          } catch (error) {
            console.error('Error fetching filmography:', error);
            setPersonFilmography(null);
          } finally {
            setLoadingFilmography(false);
          }
        }
      });
    }
    
    // For pages with a selected item
    if (selectedItem) {
      const itemLabel = selectedItem.title || selectedItem.name;
      
      if (view === 'filmography') {
        // Person filmography view
        items.push({
          label: itemLabel,
        });
      } else if (selectedItem.media_type === 'tv') {
        // TV show navigation
        items.push({
          label: itemLabel,
          onClick: view === 'episodes' ? () => {
            setSelectedSeason(null);
            setView('seasons');
          } : undefined
        });
        
        if (view === 'episodes' && selectedSeason) {
          items.push({
            label: `Season ${selectedSeason.season_number}`,
          });
        }
      } else {
        // Movie view
        items.push({
          label: itemLabel,
        });
      }
    }
    
    return items;
  };

  // File selection handlers for bulk rename
  const handleEpisodeFileSelected = (file: File, filePath: string | undefined, episode: any) => {
    const suggestedName = `S${String(selectedSeason?.season_number || 1).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')} - ${episode.name} (${quality})`;
    addFile(file, suggestedName, 'episode', episode, filePath);
  };

  const handleMovieFileSelected = (file: File, filePath: string | undefined, fileName: string) => {
    addFile(file, fileName.replace(/\.[^/.]+$/, ""), 'movie', { details: selectedItem }, filePath);
  };

  const handleDirectoryFileSelected = (file: File, filePath: string | undefined, directoryName: string) => {
    addFile(file, directoryName.replace(/\.[^/.]+$/, ""), 'directory', { seriesTitle: selectedItem?.title, network: selectedItem?.network }, filePath);
  };

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
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
        <div className="relative py-3 max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden min-w-[800px]">
          <div className="relative px-4 py-6 bg-white dark:bg-gray-800 shadow-lg sm:rounded-3xl sm:px-8 sm:py-10 flex-1 flex flex-col overflow-hidden" ref={mainContentRef}>
            <div className="max-w-5xl mx-auto flex-1 flex flex-col overflow-hidden min-w-[700px]">
              <div className="divide-y divide-gray-200 dark:divide-gray-700 flex-1 flex flex-col overflow-hidden">
                <div className="py-4 text-base leading-6 space-y-4 text-gray-700 dark:text-gray-300 sm:text-lg sm:leading-7 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                      <img 
                        src={mfrIcon} 
                        alt="Media File Renamer" 
                        className="h-10 w-10 mr-3 cursor-pointer icon-link" 
                        onClick={resetSearch}
                      />
                      <h1 className="text-3xl font-bold">Media File Renamer</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ThemeToggle />
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors"
                        title="Settings"
                      >
                        <Cog6ToothIcon className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Breadcrumb navigation - now shown on all pages */}
                  <Breadcrumb items={getBreadcrumbItems()} />
                  
                  {/* Show EnhancedSearchBar only on home/results page */}
                  {view === 'results' && (
                    <EnhancedSearchBar 
                      onSearch={handleSearch} 
                      resetTrigger={resetSearchCounter} 
                      onReset={resetSearch} 
                      hasResults={searchResults.length > 0} 
                    />
                  )}
                  
                  <div className="mt-4 flex-1 overflow-y-auto pb-32 min-h-[500px]">
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
                            genres={selectedItem.genres}
                            cast={selectedItem.cast}
                            crew={selectedItem.crew}
                            quality={quality}
                            onQualityChange={handleQualityChange}
                            onPersonSelect={async (personId: number, personName: string) => {
                              // Navigate to person's filmography
                              const personItem = {
                                id: personId,
                                media_type: 'person' as const,
                                title: '',
                                name: personName
                              };
                              await handleSelect(personItem);
                            }}
                            onFileSelected={handleDirectoryFileSelected}
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
                              onFileSelected={handleEpisodeFileSelected}
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
                          <DisplayArea
                            selectedItem={selectedItem}
                            quality={quality}
                            onPersonSelect={async (personId: number, personName: string) => {
                              // Navigate to person's filmography
                              const personItem = {
                                id: personId,
                                media_type: 'person' as const,
                                name: personName
                              };
                              await handleSelect(personItem);
                            }}
                            onFileSelected={handleMovieFileSelected}
                          />
                        </div>
                      </div>
                    )}
                    {view === 'filmography' && selectedItem && selectedItem.media_type === 'person' && (
                      <div className="flex flex-col min-h-[400px] h-full">
                        <div className="flex-1">
                          {loadingFilmography ? (
                            <div className="text-center text-gray-500 py-4">Loading filmography...</div>
                          ) : personFilmography ? (
                            <Filmography 
                              filmography={personFilmography} 
                              onItemSelect={handleFilmographyItemSelect}
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-4">No filmography found</div>
                          )}
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

      {/* Bulk Rename Panel - Fixed at bottom */}
      <BulkRenamePanel
        files={selectedFiles}
        isRenaming={isRenaming}
        onRenameAll={renameAllFiles}
        onRemoveFile={removeFile}
        onClearAll={clearAllFiles}
        onUpdateFileName={updateFileName}
      />
    </div>
  )
}

export default App
