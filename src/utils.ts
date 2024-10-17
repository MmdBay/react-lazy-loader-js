import { LFUCache } from './cache';  // Import the LFUCache implementation

// Initialize the LFUCache with a capacity of 100 items and TTL of 1 hour (3600000 ms)
const routeCache = new LFUCache<() => Promise<any>, string>(100, 3600000);

/**
 * Extracts the URL from a dynamic import function string.
 * Uses a regular expression to find the URL inside the dynamic import call.
 * Caches the result using LFUCache for efficient future lookups.
 * 
 * @param {() => Promise<any>} originalImport - The original dynamic import function.
 * @returns {string | null} - The extracted URL if found, otherwise null.
 */
export const getRouteComponentUrl = (originalImport: () => Promise<any>): string | null => {
  // Check if the URL is already in the LFUCache
  const cachedUrl = routeCache.get(originalImport);
  if (cachedUrl) {
    return cachedUrl;  // Return the cached URL if available
  }

  try {
    const fnString = originalImport.toString();
    const match = fnString.match(/import\(["']([^)]+)['"]\)/);
    const result = match ? match[1] : null;

    // Cache the result for future reuse
    if (result) {
      routeCache.set(originalImport, result);  // Store the result in LFUCache
    }

    return result;
  } catch (error) {
    // Log the error and return null if extraction fails
    console.error('Error in getRouteComponentUrl:', error);
    return null;
  }
};

/**
 * Generates a retry import function that appends a unique version query parameter to the URL
 * to bypass any potential caching issues during retries.
 * Uses LFUCache to store and retrieve previously extracted URLs.
 * 
 * @param {() => Promise<any>} originalImport - The original dynamic import function.
 * @param {number} retryCount - The current retry count, used to create a unique query parameter.
 * @returns {() => Promise<any>} - A new import function with a unique query appended to the URL.
 */
export const getRetryImportFunction = (
  originalImport: () => Promise<any>,
  retryCount: number
): (() => Promise<any>) => {
  const importUrl = getRouteComponentUrl(originalImport);

  // If there's no URL or it's the first attempt (retryCount = 0), return the original import
  if (!importUrl || retryCount === 0) {
    return originalImport;
  }

  try {
    // Use the URL constructor to manage query parameters cleanly
    const url = new URL(importUrl, window.location.href);
    // Append a unique query parameter based on retryCount and a random string to prevent caching
    url.searchParams.append('v', `${retryCount}-${Math.random().toString(36).substring(2)}`);

    // Return a new import function that uses the modified URL
    return () => import(url.toString());
  } catch (error) {
    // Log the error and return the original import function
    console.error('Error in getRetryImportFunction:', error);
    return originalImport;
  }
};
