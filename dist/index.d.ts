import React, { ComponentType } from 'react';

declare const defaultConfig: {
    circuitBreakerThreshold: number;
    resetTimeMs: number;
    maxRetryCount: number;
    initialRetryDelayMs: number;
    maxRetryDelayMs: number;
    timeoutMs: number;
};
type RetryConfig = typeof defaultConfig;

interface LoaderConfig {
    size?: number;
    borderSize?: number;
    color?: string;
    speed?: number;
    showRetries?: boolean;
    showNetworkInfo?: boolean;
    customStyle?: React.CSSProperties;
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
declare function retryDynamicImport<T extends ComponentType<any>>(importFunction: () => Promise<{
    default: T;
}>, customConfig?: Partial<RetryConfig>, loaderConfig?: Partial<LoaderConfig>): React.LazyExoticComponent<T>;
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
declare const LazyLoader: ({ LazyComponent, retryCount, loaderConfig }: {
    LazyComponent: React.LazyExoticComponent<any>;
    retryCount: number;
    loaderConfig: LoaderConfig;
}) => React.JSX.Element;
/**
 * prefetchDynamicImport: Pre-loads a dynamic component and caches it so that when the user
 * actually needs it, it loads instantly.
 *
 * @param {() => Promise<any>} importFunction - The function to dynamically import the component.
 */
declare const prefetchDynamicImport: (importFunction: () => Promise<any>) => void;
/**
 * priorityLoadComponent: This one’s for when you want to load a less important component after a delay.
 * The higher the priority value, the longer we wait before loading.
 *
 * @param {() => Promise<any>} importFunction - The function to dynamically import the component.
 * @param {number} priority - Delay in seconds before loading the component.
 */
declare const priorityLoadComponent: (importFunction: () => Promise<any>, priority: number) => void;

export { LazyLoader, prefetchDynamicImport, priorityLoadComponent, retryDynamicImport };
