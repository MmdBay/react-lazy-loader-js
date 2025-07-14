import { LFUCache } from './cache';  // Bringing in our LFUCache implementation, 'cause we'll need it to cache URLs.

// Here, we're setting up our cache. It can hold up to 100 URLs, and each one sticks around for 1 hour (3600000 ms).
// We use this cache to store the URLs of dynamically imported components, so we don't have to keep fetching them.
const routeCache = new LFUCache<() => Promise<any>, string>(100, 3600000);

/**
 * So, this function `getRouteComponentUrl` is all about pulling out the URL from a dynamic import function.
 * Basically, we turn the function into a string, look for the URL inside the `import()` call with regex, 
 * and then we store that URL in our cache for future use. No need to process the same function over and over again.
 * 
 * @param {() => Promise<any>} originalImport - The function that dynamically imports a component.
 * @returns {string | null} - The URL we extract from the function, or null if we can't find it.
 */
export const getRouteComponentUrl = (originalImport: () => Promise<any>): string | null => {
  // First, let's check if we've already cached the URL for this import function.
  const cachedUrl = routeCache.get(originalImport);
  if (cachedUrl) {
    return cachedUrl;  // If it's in the cache, we just return it and move on.
  }

  try {
    // If we don't have it cached, we turn the function into a string and use a regex to grab the URL.
    const fnString = originalImport.toString();
    const match = fnString.match(/import\(["']([^)]+)['"]\)/); // We're looking for the `import('...')` call
    const result = match ? match[1] : null; // If we find it, grab the URL part.

    // If we successfully pulled out the URL, let's stash it in the cache for next time.
    if (result) {
      routeCache.set(originalImport, result);  // Save the URL in the LFUCache.
    }

    return result; // Return the URL we found (or null if we didn't find one).
  } catch (error) {
    // If something goes wrong, log the error and return null to indicate we couldn't find a URL.
    console.error('Error in getRouteComponentUrl:', error);
    return null;
  }
};

/**
 * Now, this function `getRetryImportFunction` is for handling retries when we're dynamically importing components.
 * The idea is to tweak the URL a little bit each time (by adding a unique query parameter), so the browser doesn't 
 * just give us a cached version — this way we always get a fresh import if we need it.
 * 
 * @param {() => Promise<any>} originalImport - The original import function.
 * @param {number} retryCount - The number of times we've retried. We use this to create a unique query parameter.
 * @returns {() => Promise<any>} - A new import function with a modified URL (to bust the cache).
 */
export const getRetryImportFunction = (
  originalImport: () => Promise<any>,
  retryCount: number
): (() => Promise<any>) => {
  // First, we try to extract the URL from the import function (using the function we wrote above).
  const importUrl = getRouteComponentUrl(originalImport);

  // If there's no URL or if it's the first attempt (retryCount = 0), just return the original import function.
  if (!importUrl || retryCount === 0) {
    return originalImport;
  }

  // Check if we're in a server-side environment (SSR/SSG) where dynamic URL imports won't work
  const isServerSide = typeof window === 'undefined';

  // If we're in server-side environment, don't use dynamic URL imports as they can't be resolved at build time
  if (isServerSide) {
    // For server-side rendering, we'll use a different approach: wrap the original import with a retry mechanism
    // that doesn't rely on URL manipulation
    return () => {
      // Add a small delay to simulate cache busting without URL manipulation
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
    // Now, we create a new URL object so we can add some query parameters to it.
    const url = new URL(importUrl, window.location.href);
    
    // We append a unique versioning parameter to the URL — this makes sure the browser doesn't use a cached version.
    url.searchParams.append('v', `${retryCount}-${Math.random().toString(36).substring(2)}`);

    // We return a new import function that uses this modified URL with our custom query parameter.
    // Note: This approach works in regular React apps but not in Next.js SSR
    return () => import(/* @vite-ignore */ url.toString()); // The @vite-ignore comment is to avoid issues with Vite.
  } catch (error) {
    // If something goes wrong (like if we can't build the URL), we log the error and just return the original import.
    console.error('Error in getRetryImportFunction:', error);
    return originalImport;
  }
};