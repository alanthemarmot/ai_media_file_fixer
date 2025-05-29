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
 * Check if the API key is valid by making a test request
 * @param apiKey - The API key to validate
 * @returns Promise that resolves to true if valid, false if invalid
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/validate-key?api_key=${apiKey}`);
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Error validating API key:', error);
    return false;
  }
};
