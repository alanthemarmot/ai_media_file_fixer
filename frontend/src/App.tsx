import { useState } from 'react'
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
  const [quality] = useState('1080p');

  const handleSearch = (results: any[]) => {
    setSearchResults(results)
    setSelectedItem(null)
    setSeasons([])
    setSelectedSeason(null)
    setView('results')
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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center">
      <div className="relative py-3 max-w-7xl mx-auto w-full">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex items-center justify-center mb-8">
                  <img 
                    src="/mfr_icon.png" 
                    alt="Media File Renamer" 
                    className="h-10 w-10 mr-3 cursor-pointer icon-link" 
                    onClick={() => {
                      setSelectedItem(null);
                      setSelectedSeason(null);
                      setSeasons([]);
                      setView('results');
                    }}
                  />
                  <h1 className="text-3xl font-bold text-center">Media File Renamer</h1>
                </div>
                <SearchBar onSearch={handleSearch} />
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
