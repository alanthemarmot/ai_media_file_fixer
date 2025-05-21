import { useState } from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import SearchBar from './components/SearchBar'
import ResultsList from './components/ResultsList'
import DisplayArea from './components/DisplayArea'
import SeasonList from './components/SeasonList'
import './App.css'

function App() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null)
  const [view, setView] = useState<'results' | 'seasons' | 'details'>('results')
  const [loadingSeasons, setLoadingSeasons] = useState(false)

  // Fetch seasons for a TV show
  const getTVSeasons = async (id: number) => {
    const res = await fetch(`/api/seasons?id=${id}`);
    return await res.json();
  }

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
      setLoadingSeasons(true);
      setView('seasons');
      try {
        const s = await getTVSeasons(item.id);
        setSeasons(s);
      } finally {
        setLoadingSeasons(false);
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

  const handleSeasonSelect = (season: any) => {
    setSelectedSeason(season)
    setView('details')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center">
      <div className="relative py-3 max-w-7xl mx-auto w-full">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Media File Renamer</h1>
                <SearchBar onSearch={handleSearch} />
                <div className="mt-8 min-h-[400px]">
                  {view === 'results' && (
                    <ResultsList results={searchResults} onSelect={handleSelect} />
                  )}
                  {view === 'seasons' && selectedItem && selectedItem.media_type === 'tv' && (
                    <div className="flex flex-col min-h-[400px]">
                      <div className="flex-1">
                        {loadingSeasons ? (
                          <div className="text-center text-gray-500 py-4">Loading seasons...</div>
                        ) : (
                          <SeasonList
                            seasons={seasons}
                            onSelect={handleSeasonSelect}
                            selectedSeason={selectedSeason?.season_number}
                          />
                        )}
                      </div>
                      <div className="mt-8 flex justify-center">
                        <button onClick={handleBack} className="flex items-center text-blue-600 hover:underline">
                          <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
                        </button>
                      </div>
                    </div>
                  )}
                  {view === 'details' && selectedItem && (
                    <div className="flex flex-col min-h-[400px]">
                      <div className="flex-1">
                        <DisplayArea selectedItem={selectedItem} />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <button onClick={handleBack} className="flex items-center text-blue-600 hover:underline">
                          <ArrowLeftIcon className="w-5 h-5 mr-1" /> Back
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
