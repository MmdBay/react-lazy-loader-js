import { LFUCache } from './cache';

// Cache for storing URLs of dynamically imported components
// Can hold up to 100 URLs, each cached for 1 hour (3600000 ms)
const routeCache = new LFUCache<() => Promise<any>, string>(100, 3600000);

/**
 * Extracts the URL from a dynamic import function and caches it for future use.
 * Converts the function to a string and uses regex to find the URL inside the import() call.
 * 
 * @param originalImport - The function that dynamically imports a component
 * @returns The URL extracted from the function, or null if not found
 */
export const getRouteComponentUrl = (originalImport: () => Promise<any>): string | null => {
  // Check if we've already cached the URL for this import function
  const cachedUrl = routeCache.get(originalImport);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    // Convert the function to a string and use regex to extract the URL
    const fnString = originalImport.toString();
    const match = fnString.match(/import\(["']([^)]+)['"]\)/);
    const result = match ? match[1] : null;

    // Cache the URL if we found it
    if (result) {
      routeCache.set(originalImport, result);
    }

    return result;
  } catch (error) {
    console.error('Error in getRouteComponentUrl:', error);
    return null;
  }
};

/**
 * Creates a retry import function that handles cache busting for dynamic imports.
 * Modifies the URL by adding a unique query parameter on each retry to ensure fresh imports.
 * 
 * @param originalImport - The original import function
 * @param retryCount - The number of retry attempts, used to create unique query parameters
 * @returns A new import function with cache-busting URL modifications
 */
export const getRetryImportFunction = (
  originalImport: () => Promise<any>,
  retryCount: number
): (() => Promise<any>) => {
  // Extract the URL from the import function
  const importUrl = getRouteComponentUrl(originalImport);

  // If there's no URL or if it's the first attempt, return the original import function
  if (!importUrl || retryCount === 0) {
    return originalImport;
  }

  // Check if we're in a server-side environment where dynamic URL imports won't work
  const isServerSide = typeof window === 'undefined';
  // Detect Next.js client-side runtime environment
  const isNextJs = !isServerSide && typeof (window as any)?.__NEXT_DATA__ !== 'undefined';

  // For server-side environments, use a delay-based retry mechanism
  if (isServerSide || isNextJs) {
    return () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          originalImport()
            .then(resolve)
            .catch(reject);
        }, retryCount * 10); // Small delay based on retry count
      });
    };
  }

  try {
    // Create a new URL object and add cache-busting query parameters
    const url = new URL(importUrl, window.location.href);
    url.searchParams.append('v', `${retryCount}-${Math.random().toString(36).substring(2)}`);

    // Return a new import function with the modified URL
    // Include bundler ignore hints to skip static analysis
    return () => import(/* @vite-ignore */ /* webpackIgnore: true */ url.toString());
  } catch (error) {
    console.error('Error in getRetryImportFunction:', error);
    return originalImport;
  }
};