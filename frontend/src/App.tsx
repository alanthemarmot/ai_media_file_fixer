import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ResultsList from './components/ResultsList'
import DisplayArea from './components/DisplayArea'
import type { SearchResult } from './api'
import './App.css'

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null)

  const handleSearch = (results: SearchResult[]) => {
    setSearchResults(results)
    setSelectedItem(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 max-w-5xl mx-auto w-full">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-4xl mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Media File Renamer</h1>
                <SearchBar onSearch={handleSearch} />
                <div className="mt-8 flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <ResultsList results={searchResults} onSelect={setSelectedItem} />
                  </div>
                  <div className="md:w-1/2">
                    <DisplayArea selectedItem={selectedItem} />
                  </div>
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
