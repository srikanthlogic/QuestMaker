// services/pathService.ts

// This function dynamically determines the base path of the application.
// It assumes the main script is named 'index.tsx' and is loaded with a <script> tag.
// It finds the script tag and extracts the path component from its 'src' attribute.
function getBasePath(): string {
  // In a non-browser environment, document might not be defined.
  if (typeof document === 'undefined') {
    return '';
  }

  const script = document.querySelector('script[src*="/index.tsx"]');
  if (script) {
    const src = script.getAttribute('src');
    if (src) {
      // The base path is everything before the last '/'
      const basePath = src.substring(0, src.lastIndexOf('/'));
      // If the script is at the root (e.g. /index.tsx), basePath will be empty.
      // We return it as is, and asset() will handle it.
      return basePath;
    }
  }
  // Fallback for local development or if the script isn't found.
  return '';
}

// Memoize the result of getBasePath so it only runs once.
const BASE_PATH = getBasePath();

/**
 * Prepends the application's base path to a given path.
 * Use this for constructing URLs for assets, links, and API calls.
 * @param path - The application-relative path (e.g., '/docs/README.md').
 * @returns The full path including the base path (e.g., '/QuestMaker/docs/README.md').
 */
export const asset = (path: string): string => {
  // Remove leading slash from the path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;

  // If BASE_PATH is empty, we are at the root. Just return the path with a leading slash.
  if (BASE_PATH === '') {
    return `/${cleanPath}`;
  }

  return `${BASE_PATH}/${cleanPath}`;
};

/**
 * Strips the base path from a full window.location.pathname.
 * Use this to get the application-relative path for routing.
 * @param fullPath - The full path from the browser (e.g., window.location.pathname).
 * @returns The application-relative path (e.g., '/docs/README.md').
 */
export const getAppPath = (fullPath: string): string => {
    // If base path is empty, the app path is the full path.
    if (BASE_PATH === '') {
        return fullPath;
    }

    if (fullPath.startsWith(BASE_PATH)) {
        const appPath = fullPath.substring(BASE_PATH.length);
        // Return '/' for the root path, otherwise the path itself.
        return appPath.startsWith('/') ? appPath : `/${appPath}`;
    }

    return fullPath;
}

// For debugging purposes, let's expose the detected base path.
export const getDetectedBasePath = () => BASE_PATH;
