import axios from 'axios';
import { getApiKey } from './services/apiKeyService';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to add API key header if available
api.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }
  return config;
});

export interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  year?: number;
  poster_path?: string;
  profile_path?: string;
  known_for_department?: string;
  popularity?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  profile_path?: string;
}

export interface CrewInfo {
  directors?: CrewMember[];
  composers?: CrewMember[];
}

export interface MovieDetails {
  title: string;
  year: number;
  genres: string[];
  cast: CastMember[];
  crew: CrewInfo;
}

export interface TVShowDetails {
  title: string;
  network: string;
  season: number;
  episode: number;
  episode_title: string;
  genres: string[];
  cast: CastMember[];
  crew: CrewInfo;
}

export interface TVSeason {
  season_number: number;
  name: string;
  poster_path?: string;
  episode_count?: number;
}

export interface TVEpisode {
  episode_number: number;
  season_number: number;
  name: string;
  air_date?: string;
}

export interface PersonDetails {
  id: number;
  name: string;
  known_for_department?: string;
  profile_path?: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
}

export interface FilmographyItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  year?: number;
  poster_path?: string;
  character?: string;
  job?: string;
  department?: string;
  role_type: 'cast' | 'crew';
}

export interface PersonFilmography {
  person: PersonDetails;
  cast: FilmographyItem[];
  crew: FilmographyItem[];
}

export type MediaDetails = MovieDetails | TVShowDetails;

/**
 * Validates if an API key is valid
 * @param apiKey - The API key to validate
 * @returns A promise that resolves to true if valid, false otherwise
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/validate-key`, {
      params: { api_key: apiKey }
    });
    return response.data.valid === true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};

export const searchMedia = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await api.get(`/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to the server. Is the backend running?');
      }
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('API key required')) {
        throw new Error('API key is required. Please configure your TMDB API key.');
      }
      if (error.response?.status === 404) {
        throw new Error('Search endpoint not found. Please check the API URL.');
      }
      throw new Error(error.response?.data?.detail || 'An error occurred while searching.');
    }
    throw error;
  }
};

export const getMediaDetails = async (id: number, type: 'movie' | 'tv'): Promise<MediaDetails> => {
  const response = await api.get(`/details`, {
    params: { id, type }
  });
  return response.data;
};

export const getTVSeasons = async (id: number): Promise<TVSeason[]> => {
  try {
    const response = await api.get(`/seasons`, {
      params: { id }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to the server. Is the backend running?');
      }
      if (error.response?.status === 404) {
        throw new Error('Seasons endpoint not found. Please check the API URL.');
      }
      throw new Error(error.response?.data?.detail || 'An error occurred while fetching seasons.');
    }
    throw error;
  }
};

export const getTVEpisodes = async (id: number, season_number: number): Promise<TVEpisode[]> => {
  try {
    const response = await api.get(`/episodes`, {
      params: { id, season_number }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'An error occurred while fetching episodes.');
    }
    throw error;
  }
};

export const checkServerApiKeyStatus = async (): Promise<boolean> => {
  try {
    const response = await api.get('/server-key-status');
    return response.data.has_key;
  } catch (error) {
    console.error('Error checking server API key status:', error);
    return false;
  }
};

export const getPersonFilmography = async (personId: number): Promise<PersonFilmography> => {
  try {
    const response = await api.get(`/person/${personId}/filmography`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'An error occurred while fetching filmography.');
    }
    throw error;
  }
};
