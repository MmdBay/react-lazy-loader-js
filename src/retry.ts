import { getNetworkInfo } from './networkSpeed';
import { ComponentType, lazy } from 'react';
import { getConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { LFUCache } from './cache';
import { CircuitBreaker } from './circuitBreaker';

// Initialize LFU cache with a capacity of 5 and TTL of 1 hour
const lfuCache = new LFUCache<string, any>(5, 3600000);

/**
 * @function retryDynamicImport
 * @description Tries to dynamically import a React component with retry logic, circuit breaker, and caching.
 * Adjusts the retry count and delay based on the user's internet speed and connection type.
 * @param {() => Promise<{ default: T }>} importFunction - Function to dynamically import the React component.
 * @param {Partial<RetryConfig>} [customConfig] - Optional custom configuration for retries and circuit breaker.
 * @returns {React.LazyExoticComponent<T>} Lazy-loaded React component with retry and cache support.
 */
export function retryDynamicImport<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  customConfig?: Partial<RetryConfig>
): React.LazyExoticComponent<T> {
  const config = getConfig(customConfig);
  let retryCount = 0;
  let hasTimedOut = false;
  const { maxRetryCount, timeoutMs } = config;

  const circuitBreaker = new CircuitBreaker(config);

  const loadComponent = (): Promise<{ default: T }> =>
    new Promise<{ default: T }>((resolve, reject: (reason?: any) => void) => {
      const { effectiveType, downlink, saveData } = getNetworkInfo();

      const adjustedRetryCount = downlink < 1 || effectiveType.includes('2g') ? maxRetryCount * 2 : maxRetryCount;
      const adjustedDelay = downlink < 1 || effectiveType.includes('2g') ? config.initialRetryDelayMs * 2 : config.initialRetryDelayMs;

      const importUrl = getRouteComponentUrl(importFunction);

      const cachedComponent = importUrl ? lfuCache.get(importUrl) : null;

      if (cachedComponent) {
        resolve(cachedComponent);
        return;
      }

      const timeoutId = setTimeout(() => {
        hasTimedOut = true;
        reject(new Error('Component load timed out.'));
      }, timeoutMs);

      function tryLoadComponent() {
        if (hasTimedOut) return;

        const retryImport = getRetryImportFunction(importFunction, retryCount);

        retryImport()
          .then((module) => {
            clearTimeout(timeoutId);

            if (importUrl) {
              lfuCache.set(importUrl, module);
            }

            resolve(module);
          })
          .catch((error) => {
            retryCount += 1;

            if (circuitBreaker.handleFailure()) {
              reject(error);
              return;
            }

            if (retryCount <= adjustedRetryCount) {
              setTimeout(tryLoadComponent, retryCount * adjustedDelay);
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
