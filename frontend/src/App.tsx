import { useState, useEffect, useRef } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SearchBar from './components/SearchBar'
import ResultsList from './components/ResultsList'
import DisplayArea from './components/DisplayArea'
import SeasonList from './components/SeasonList'
import EpisodeList from './components/EpisodeList';
import './App.css'
import './components/IconLink.css'
import { getTVSeasons, getTVEpisodes, getMediaDetails } from './api';

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
  const [contentRequiresScroll, setContentRequiresScroll] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

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

  const handleBack = () => {
    setSelectedItem(null)
    setSelectedSeason(null)
    setSeasons([])
    setView('results')
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

  // Check if content requires scroll
  useEffect(() => {
    const checkScroll = () => {
      const el = mainContentRef.current;
      if (!el) return;
      const viewportHeight = window.innerHeight;
      const contentHeight = el.scrollHeight;
      setContentRequiresScroll(contentHeight > viewportHeight * 0.9);
    };
    
    // Run check after a short delay to ensure content is rendered
    const timer = setTimeout(checkScroll, 100);
    
    window.addEventListener('resize', checkScroll);
    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [view, searchResults, selectedItem, selectedSeason, episodes, loadingEpisodes]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center">
      <div className="relative py-3 max-w-7xl mx-auto w-full">
        {/* Top-left back button, not flush to edge */}
        {view !== 'results' && contentRequiresScroll && (
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-xs shadow transition-colors z-20"
            style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }}
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1 text-white" /> Back
          </button>
        )}
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 overflow-x-hidden" ref={mainContentRef}>
          <div className="max-w-6xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex items-center justify-center mb-8">
                  <img 
                    src="/mfr_icon.png" 
                    alt="Media File Renamer" 
                    className="h-10 w-10 mr-3 cursor-pointer icon-link" 
                    onClick={resetSearch}
                  />
                  <h1 className="text-3xl font-bold text-center">Media File Renamer</h1>
                </div>
                <SearchBar 
                  onSearch={handleSearch} 
                  resetTrigger={resetSearchCounter} 
                  onReset={resetSearch} 
                  hasResults={searchResults.length > 0} 
                />
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
                          network={selectedItem.network}
                          quality={quality}
                          onQualityChange={handleQualityChange}
                        />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <button onClick={handleBack} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors">
                          <ArrowLeftIcon className="w-5 h-5 mr-1 text-white" /> Back
                        </button>
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
                      <div className="mt-8 flex justify-center">
                        <button onClick={() => setView('seasons')} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors">
                          <ArrowLeftIcon className="w-5 h-5 mr-1 text-white" /> Back
                        </button>
                      </div>
                    </div>
                  )}
                  {view === 'details' && selectedItem && (
                    <div className="flex flex-col min-h-[400px] h-full">
                      <div className="flex-1">
                        <DisplayArea selectedItem={selectedItem} quality={quality} />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <button onClick={handleBack} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 transition-colors">
                          <ArrowLeftIcon className="w-5 h-5 mr-1 text-white" /> Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
