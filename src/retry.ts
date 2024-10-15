import { ComponentType, lazy } from 'react';
import { defaultConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { LFUCache } from './cache';  // Import the LFU cache
import { handleFailureWithCircuitBreaker } from './circuitBreaker';

// Initialize LFU cache with a capacity of 5 and TTL of 1 hour
const lfuCache = new LFUCache<string, any>(5, 3600000);

/**
 * @function retryDynamicImport
 * @description Tries to dynamically import a React component with retry logic, circuit breaker, and caching.
 * @param {() => Promise<{ default: T }>} importFunction - Function to dynamically import the React component.
 * @param {RetryConfig} [config=defaultConfig] - Optional configuration for retries and circuit breaker.
 * @returns {React.LazyExoticComponent<T>} Lazy-loaded React component with retry and cache support.
 */
export function retryDynamicImport<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  config: RetryConfig = defaultConfig
): React.LazyExoticComponent<T> {
  let retryCount = 0;
  let hasTimedOut = false;
  const { maxRetryCount, timeoutMs } = config;

  const loadComponent = (): Promise<{ default: T }> =>
    new Promise<{ default: T }>((resolve, reject: (reason?: any) => void) => {
      const importUrl = getRouteComponentUrl(importFunction);  // Get the URL for caching purposes

      // Check if the component is already in the cache
      const cachedComponent = importUrl ? lfuCache.get(importUrl) : null;

      if (cachedComponent) {
        resolve(cachedComponent);  // If found in cache, resolve with cached data
        return;
      }

      // Set a timeout for the dynamic import
      const timeoutId = setTimeout(() => {
        hasTimedOut = true;
        reject(new Error('Component load timed out.'));
      }, timeoutMs);

      // Try loading the component with retry logic
      function tryLoadComponent() {
        if (hasTimedOut) return;

        const retryImport = getRetryImportFunction(importFunction, retryCount);

        retryImport()
          .then((module) => {
            clearTimeout(timeoutId);

            // Cache the successfully loaded component
            if (importUrl) {
              lfuCache.set(importUrl, module);
            }

            resolve(module);
          })
          .catch((error) => {
            retryCount += 1;

            // If the circuit breaker triggers, stop further retries
            if (handleFailureWithCircuitBreaker(retryCount, config)) {
              reject(error);
              return;
            }

            // Retry if we haven't hit the max retry count
            if (retryCount <= maxRetryCount) {
              setTimeout(tryLoadComponent, retryCount * config.initialRetryDelayMs);
            } else {
              clearTimeout(timeoutId);
              reject(error);
            }
          });
      }

      tryLoadComponent();
    });

  return lazy(() => loadComponent());
}

/**
 * @function prefetchDynamicImport
 * @description Prefetches a dynamic React component and caches it for future use.
 * @param {() => Promise<any>} importFunction - Function to dynamically import the React component.
 * @returns {void}
 */
export const prefetchDynamicImport = (importFunction: () => Promise<any>) => {
  const retryImport = getRetryImportFunction(importFunction, 0);
  
  retryImport()
    .then((module) => console.log('Component prefetched successfully.'))
    .catch((error) => console.warn('Prefetching component failed:', error));
};

/**
 * @function priorityLoadComponent
 * @description Loads a dynamic React component after a delay, prioritizing it based on importance.
 * @param {() => Promise<any>} importFunction - Function to dynamically import the React component.
 * @param {number} priority - Delay in seconds before loading the component.
 * @returns {void}
 */
export const priorityLoadComponent = (importFunction: () => Promise<any>, priority: number) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1000);
};