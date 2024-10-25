import { getNetworkInfo } from './networkSpeed'; // This grabs the user's network speed and connection type
import React, { ComponentType, lazy } from 'react';
import { getConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { LFUCache } from './cache'; // Our LFU (Least Frequently Used) cache to store components
import { CircuitBreaker } from './circuitBreaker'; // Circuit breaker to stop overloading retries
import Loader from './LoadingSpinner'; // This is the loader we show when the component is loading

// Set up the LFU cache with a capacity of 5 items that last for an hour.
const lfuCache = new LFUCache<string, any>(5, 3600000);

interface LoaderConfig {
  size?: number; // Size of the loader (how big the spinner is)
  borderSize?: number; // Thickness of the loader's border
  color?: string; // Color of the loader
  speed?: number; // Speed of the loader’s spin (in seconds)
  showRetries?: boolean; // Show retry attempts on the loader?
  showNetworkInfo?: boolean; // Show network speed and connection type?
  customStyle?: React.CSSProperties; // Any custom styles you wanna throw on the loader container
}

/**
 * Alright, so this `retryDynamicImport` function is how we load React components dynamically,
 * but with some extra retry logic in case things fail. We use a circuit breaker and cache
 * to make sure we don't keep retrying endlessly.
 * 
 * @template T - The component type.
 * @param {() => Promise<{ default: T }>} importFunction - This is the function that imports the component.
 * @param {Partial<RetryConfig>} [customConfig] - Optional retry and circuit breaker settings.
 * @param {Partial<LoaderConfig>} [loaderConfig] - Optional settings for the loading spinner.
 * @returns {React.LazyExoticComponent<T>} - This returns a lazy-loaded React component.
 */
export function retryDynamicImport<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  customConfig?: Partial<RetryConfig>,
  loaderConfig?: Partial<LoaderConfig>
): React.LazyExoticComponent<T> {
  const config = getConfig(customConfig); // We grab the retry and circuit breaker settings here
  let retryCount = 0; // Keep track of how many retries we’ve done
  let hasTimedOut = false; // Flag to check if we’ve hit a timeout
  const { maxRetryCount, timeoutMs } = config; // Grab the max retry count and timeout from config

  // Setting up the circuit breaker, which stops retries after too many failures
  const circuitBreaker = new CircuitBreaker(config);

  // This function handles loading the component with retry logic
  const loadComponent = (): Promise<{ default: T }> =>
    new Promise<{ default: T }>((resolve, reject) => {
      const { effectiveType, downlink } = getNetworkInfo(); // Get the user's network info (speed, type, etc.)

      // Adjust retry behavior based on network speed/type. Slower networks get more retries and delays.
      const adjustedRetryCount = downlink < 1 || effectiveType.includes('2g') ? maxRetryCount * 2 : maxRetryCount;
      const adjustedDelay = downlink < 1 || effectiveType.includes('2g') ? config.initialRetryDelayMs * 2 : config.initialRetryDelayMs;

      const importUrl = getRouteComponentUrl(importFunction); // Figure out the URL of the component we’re importing

      // Check if the component is already cached, and use that if it is
      const cachedComponent = importUrl ? lfuCache.get(importUrl) : null;

      if (cachedComponent) {
        resolve(cachedComponent); // Boom, it's cached — just return it
        return;
      }

      // This timeout prevents the load from hanging forever
      const timeoutId = setTimeout(() => {
        hasTimedOut = true;
        reject(new Error('Component load timed out.'));
      }, timeoutMs);

      // Function to try loading the component, with retries if necessary
      function tryLoadComponent() {
        if (hasTimedOut) return; // If it timed out, no point in continuing

        const retryImport = getRetryImportFunction(importFunction, retryCount); // Get the retry function

        retryImport()
          .then((module) => {
            clearTimeout(timeoutId); // Clear the timeout since we succeeded

            if (importUrl) {
              lfuCache.set(importUrl, module); // Cache the loaded component for next time
            }

            resolve(module); // Resolve with the successfully loaded component
          })
          .catch((error) => {
            retryCount += 1; // Increment the retry count

            if (circuitBreaker.handleFailure()) {
              reject(error); // If the circuit breaker kicks in, stop retrying
              return;
            }

            // If we still have retries left, keep trying after a delay
            if (retryCount <= adjustedRetryCount) {
              setTimeout(tryLoadComponent, retryCount * adjustedDelay);
            } else {
              clearTimeout(timeoutId); // If we run out of retries, clear the timeout and reject the promise
              reject(error);
            }
          });
      }

      tryLoadComponent(); // Start trying to load the component
    });

  return lazy(() => loadComponent()); // Return a lazy-loaded component with retry logic baked in
}

/**
 * This is the `LazyLoader` component, which wraps our lazy-loaded component and 
 * shows a loading spinner while it's doing its thing. The spinner is customizable 
 * with stuff like size, color, speed, etc.
 * 
 * @param {Object} props - Props for LazyLoader.
 * @param {React.LazyExoticComponent<any>} props.LazyComponent - The component we’re lazy-loading.
 * @param {number} props.retryCount - Number of retry attempts.
 * @param {LoaderConfig} props.loaderConfig - Custom config for the loader (spinner).
 * @returns {JSX.Element} - Returns the component wrapped with a loader.
 */
export const LazyLoader = ({ LazyComponent, retryCount, loaderConfig }: { LazyComponent: React.LazyExoticComponent<any>, retryCount: number, loaderConfig: LoaderConfig }) => (
  <React.Suspense
    fallback={
      <Loader
        retries={retryCount} // Show how many retries have happened
        size={loaderConfig.size} // Spinner size
        borderSize={loaderConfig.borderSize} // Spinner border thickness
        color={loaderConfig.color} // Spinner color
        speed={loaderConfig.speed} // How fast the spinner rotates
        showRetries={loaderConfig.showRetries} // Should we show the retry count?
        showNetworkInfo={loaderConfig.showNetworkInfo} // Should we show network info?
        customStyle={loaderConfig.customStyle} // Custom styling
      />
    }
  >
    <LazyComponent /> {/* Render the lazy-loaded component here */}
  </React.Suspense>
);

/**
 * prefetchDynamicImport: Pre-loads a dynamic component and caches it so that when the user 
 * actually needs it, it loads instantly.
 * 
 * @param {() => Promise<any>} importFunction - The function to dynamically import the component.
 */
export const prefetchDynamicImport = (importFunction: () => Promise<any>) => {
  const retryImport = getRetryImportFunction(importFunction, 0); // Start with 0 retries
  
  retryImport()
    .then((module) => console.log('Component prefetched successfully.')) // Successfully prefetched
    .catch((error) => console.warn('Prefetching component failed:', error)); // If it fails, log the error
};

/**
 * priorityLoadComponent: This one’s for when you want to load a less important component after a delay.
 * The higher the priority value, the longer we wait before loading.
 * 
 * @param {() => Promise<any>} importFunction - The function to dynamically import the component.
 * @param {number} priority - Delay in seconds before loading the component.
 */
export const priorityLoadComponent = (importFunction: () => Promise<any>, priority: number) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1000); // Delay the load by priority seconds
};
