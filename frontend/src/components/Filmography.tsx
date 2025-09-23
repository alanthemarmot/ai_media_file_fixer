import { useState } from 'react';
import type { PersonFilmography, FilmographyItem } from '../api';

interface FilmographyProps {
  filmography: PersonFilmography;
  onItemSelect: (item: FilmographyItem) => void;
}

const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export default function Filmography({ filmography, onItemSelect }: FilmographyProps) {
  const [activeTab, setActiveTab] = useState<string>('primary');

  // Determine person type
  const isActor = filmography.person.known_for_department === 'Acting' || filmography.cast.length > filmography.crew.length;
  const isComposer = filmography.person.known_for_department === 'Sound';

  // Categorize content based on person type
  const categorizeContent = () => {
    if (isComposer) {
      // Composer categories: Composer, Other
      const composerWork = filmography.crew.filter(item => 
        item.department === 'Sound' || (item.job && item.job.toLowerCase().includes('composer'))
      );
      const other = [
        ...filmography.cast, // Any acting work
        ...filmography.crew.filter(item => 
          item.department !== 'Sound' && !(item.job && item.job.toLowerCase().includes('composer'))
        )
      ];

      return {
        primary: { title: `Composer (${composerWork.length})`, items: composerWork },
        secondary: other.length > 0 ? { title: `Other (${other.length})`, items: other } : null,
        tertiary: null
      };
    } else if (isActor) {
      // Actor categories: Film, TV, Other
      const films = filmography.cast.filter(item => item.media_type === 'movie');
      const tv = filmography.cast.filter(item => item.media_type === 'tv');
      const other = [
        ...filmography.crew, // Any crew work (directing, producing, etc.)
        // Add any other types of appearances here
      ];

      return {
        primary: { title: `Films (${films.length})`, items: films },
        secondary: { title: `TV Shows (${tv.length})`, items: tv },
        tertiary: other.length > 0 ? { title: `Other (${other.length})`, items: other } : null
      };
    } else {
      // Director/Crew categories: Directed, Produced, Other
      const directed = filmography.crew.filter(item => item.department === 'Directing');
      const produced = filmography.crew.filter(item => item.department === 'Production');
      const other = [
        ...filmography.cast, // Any acting work
        ...filmography.crew.filter(item => !['Directing', 'Production'].includes(item.department || ''))
      ];

      return {
        primary: { title: `Directed (${directed.length})`, items: directed },
        secondary: { title: `Produced (${produced.length})`, items: produced },
        tertiary: other.length > 0 ? { title: `Other (${other.length})`, items: other } : null
      };
    }
  };

  const categories = categorizeContent();

  const renderFilmographyGrid = (items: FilmographyItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No items in this category
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <button
            key={`${item.media_type}-${item.id}-${index}`}
            onClick={() => onItemSelect(item)}
            className="flex flex-col items-center p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {item.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                alt={item.title}
                className="w-24 h-36 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-24 h-36 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs">
                No Image
              </div>
            )}
            <span className="font-medium text-center text-sm line-clamp-2 text-gray-900 dark:text-gray-100">{item.title}</span>
            {item.year && <span className="text-xs text-gray-500 dark:text-gray-400">{item.year}</span>}
            {item.character && (
              <span className="text-xs text-blue-600 dark:text-blue-400 text-center line-clamp-1">as {item.character}</span>
            )}
            {item.job && (
              <span className="text-xs text-green-600 dark:text-green-400 text-center line-clamp-1">{item.job}</span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500 uppercase mt-1">
              {item.media_type}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const availableTabs = [
    { key: 'primary', ...categories.primary },
    ...(categories.secondary ? [{ key: 'secondary', ...categories.secondary }] : []),
    ...(categories.tertiary ? [{ key: 'tertiary', ...categories.tertiary }] : [])
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Person Info Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-600">
        <div className="flex items-start space-x-6">
          {filmography.person.profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w185${filmography.person.profile_path}`}
              alt={filmography.person.name}
              className="w-32 h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-300">
              No Photo
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{filmography.person.name}</h2>
            {filmography.person.known_for_department && (
              <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">
                {filmography.person.known_for_department === 'Sound' ? 'Composer' : filmography.person.known_for_department}
              </p>
            )}
            {filmography.person.birthday && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">Born:</span> {filmography.person.birthday} ({calculateAge(filmography.person.birthday)} years)
              </p>
            )}
            {filmography.person.place_of_birth && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                <span className="font-medium">Place of Birth:</span> {filmography.person.place_of_birth}
              </p>
            )}
            {filmography.person.biography && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">{filmography.person.biography}</p>
            )}
          </div>
        </div>
      </div>

      {/* Filmography sections */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Filmography</h2>
        
        {/* Tab Navigation */}
        <div className="w-full mb-6">
          <nav className="flex w-full">
            {availableTabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-4 font-medium text-md text-center ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } ${
                  index === 0 
                    ? 'rounded-l-md' 
                    : index === availableTabs.length - 1 
                    ? 'rounded-r-md' 
                    : ''
                }`}
              >
                {tab.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {availableTabs.map(tab => (
            activeTab === tab.key && (
              <div key={tab.key}>
                {renderFilmographyGrid(tab.items)}
              </div>
            )
          ))}
        </div>

        {filmography.cast.length === 0 && filmography.crew.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No filmography available
          </div>
        )}
      </div>
    </div>
  );
}
