import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  year: number;
}

export interface MovieDetails {
  title: string;
  year: number;
}

export interface TVShowDetails {
  title: string;
  network: string;
  season: number;
  episode: number;
  episode_title: string;
}

export type MediaDetails = MovieDetails | TVShowDetails;

export const searchMedia = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Unable to connect to the server. Is the backend running?');
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
  const response = await axios.get(`${API_BASE_URL}/details`, {
    params: { id, type }
  });
  return response.data;
};
