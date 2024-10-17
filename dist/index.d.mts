import { ComponentType } from 'react';

declare const defaultConfig: {
    maxRetryCount: number;
    initialRetryDelayMs: number;
    maxRetryDelayMs: number;
    timeoutMs: number;
    circuitBreakerThreshold: number;
    resetTimeMs: number;
};
type RetryConfig = typeof defaultConfig;

/**
 * @function retryDynamicImport
 * @description Tries to dynamically import a React component with retry logic, circuit breaker, and caching.
 * @param {() => Promise<{ default: T }>} importFunction - Function to dynamically import the React component.
 * @param {RetryConfig} [config=defaultConfig] - Optional configuration for retries and circuit breaker.
 * @returns {React.LazyExoticComponent<T>} Lazy-loaded React component with retry and cache support.
 */
declare function retryDynamicImport<T extends ComponentType<any>>(importFunction: () => Promise<{
    default: T;
}>, config?: RetryConfig): React.LazyExoticComponent<T>;
/**
 * @function prefetchDynamicImport
 * @description Prefetches a dynamic React component and caches it for future use.
 * @param {() => Promise<any>} importFunction - Function to dynamically import the React component.
 * @returns {void}
 */
declare const prefetchDynamicImport: (importFunction: () => Promise<any>) => void;
/**
 * @function priorityLoadComponent
 * @description Loads a dynamic React component after a delay, prioritizing it based on importance.
 * @param {() => Promise<any>} importFunction - Function to dynamically import the React component.
 * @param {number} priority - Delay in seconds before loading the component.
 * @returns {void}
 */
declare const priorityLoadComponent: (importFunction: () => Promise<any>, priority: number) => void;

export { prefetchDynamicImport, priorityLoadComponent, retryDynamicImport };
