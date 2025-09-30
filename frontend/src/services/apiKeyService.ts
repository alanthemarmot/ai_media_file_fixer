// API Key Management Service
// Handles saving and retrieving the TMDB API key

/**
 * LocalStorage key for the API key
 */
const API_KEY_STORAGE_KEY = 'tmdb_api_key';

/**
 * Check if an API key is stored
 * @returns boolean indicating if an API key exists
 */
export const hasApiKey = (): boolean => {
  return !!localStorage.getItem(API_KEY_STORAGE_KEY);
};

/**
 * Get the stored API key
 * @returns the API key or null if none exists
 */
export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

/**
 * Save the API key to local storage
 * @param apiKey - The API key to save
 */
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
};

/**
 * Clear the stored API key
 */
export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

/**
 * Check if the server has a TMDB API key configured
 * @returns Promise that resolves to true if server has key, false otherwise
 */
export const checkServerApiKey = async (): Promise<boolean> => {
  try {
    // Import here to avoid circular dependency
    const { checkServerApiKeyStatus } = await import('../api');
    return await checkServerApiKeyStatus();
  } catch (error) {
    console.error('Error checking server API key:', error);
    return false;
  }
};

/**
 * Check if an API key is valid by making a test request
 * @param apiKey - The API key to validate
 * @returns Promise that resolves to true if valid, false if invalid
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // First try the backend server validation
    const response = await fetch(`http://localhost:8000/api/validate-key?api_key=${apiKey}`);
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    // If backend is unavailable, validate directly with TMDb API
    console.log('Backend unavailable, validating directly with TMDb API');
    try {
      const directResponse = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
      return directResponse.ok && directResponse.status === 200;
    } catch (directError) {
      console.error('Error validating API key directly:', directError);
      return false;
    }
  }
};
