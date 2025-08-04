
const API_KEY_STORAGE_KEY = 'questcraft_gemini_api_key';

/**
 * Saves the user-provided API key to sessionStorage.
 * @param apiKey - The Gemini API key string.
 */
export const saveApiKey = (apiKey: string): void => {
  if (!apiKey) {
    clearApiKey();
    return;
  }
  try {
    sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (e) {
    console.error("Failed to save API key to sessionStorage", e);
  }
};

/**
 * Retrieves the API key. It first checks sessionStorage, then falls back to process.env.API_KEY.
 * @returns The API key string, or null if not found.
 */
export const getApiKey = (): string | null => {
  try {
    const sessionKey = sessionStorage.getItem(API_KEY_STORAGE_KEY);
    if (sessionKey) {
      return sessionKey;
    }
  } catch (e) {
    console.error("Failed to get API key from sessionStorage", e);
  }
  // Fallback to environment variable if it exists for developers
  return process.env.API_KEY || null;
};

/**
 * Clears the user-provided API key from sessionStorage.
 */
export const clearApiKey = (): void => {
    try {
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch(e) {
        console.error("Failed to clear API key from sessionStorage", e);
    }
}
