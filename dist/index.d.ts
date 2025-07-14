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

/**
 * This is the `LFUCache` class. It’s basically a "Least Frequently Used" cache,
 * so if something hasn’t been used in a while, we’re gonna kick it out first.
 * Oh, and we also keep track of how long stuff is good for with TTL (Time To Live).
 */
declare class LFUCache<K, V> {
    private capacity;
    private cache;
    private ttl;
    private heap;
    constructor(capacity: number, ttl: number);
    /**
     * `get` is how we grab an item from the cache. If it's still valid (not expired),
     * we return it and increase its frequency because, well, we just used it.
     */
    get(key: K): V | undefined;
    /**
     * `set` adds a new item to the cache. If we’re at full capacity, we gotta kick out
     * the least-used item to make space. If the item already exists, we just update it.
     */
    set(key: K, value: V): void;
    /**
     * `evictLeastFrequentlyUsed` kicks out the item that’s been used the least.
     * We call this when the cache is full and we need space for new stuff.
     */
    private evictLeastFrequentlyUsed;
}

type RetryStrategy = 'exponential' | 'linear' | ((retry: number, error: any) => number);
type CacheBustingStrategy = 'query' | 'hash';
type PrefetchStrategy = 'eager' | 'idle' | 'on-hover' | 'on-visible';
/**
 * Advanced retry configuration for dynamic imports.
 */
interface AdvancedRetryConfig extends Partial<RetryConfig> {
    strategy?: RetryStrategy;
    customDelayFn?: (retry: number, error: any) => number;
    onRetry?: (retry: number, error: any) => void;
    onSuccess?: (module: any) => void;
    onError?: (error: any) => void;
    retryCondition?: (error: any) => boolean;
}
type CacheType = 'lfu' | 'lru' | 'memory' | 'localStorage' | 'indexeddb' | 'custom';
interface AdvancedCacheConfig {
    enabled?: boolean;
    customCache?: LFUCache<string, any> | any;
    key?: (importFn: () => Promise<any>) => string;
    maxAge?: number;
    type?: CacheType;
}
/**
 * Advanced circuit breaker configuration for dynamic imports.
 */
interface AdvancedCircuitBreakerConfig {
    enabled?: boolean;
    threshold?: number;
    resetTime?: number;
    customStrategy?: (failures: number, lastError: any) => boolean;
}
interface TelemetryEvent {
    type: string;
    data?: any;
    timestamp: number;
}
type TelemetryHook = (event: TelemetryEvent) => void;
/**
 * Advanced logging configuration for dynamic imports.
 */
interface AdvancedLogConfig {
    enabled?: boolean;
    logger?: (event: string, data: any) => void;
    telemetryHook?: TelemetryHook;
}
interface MultiStageLoadingConfig {
    skeleton?: React.ReactNode;
    spinner?: React.ReactNode;
    delay?: number;
}
/**
 * Advanced loader configuration for LazyLoader.
 */
interface AdvancedLoaderConfig extends Omit<LoaderConfig, 'errorFallback'> {
    component?: React.ReactNode;
    fallback?: React.ReactNode;
    errorFallback?: (error: any, retry: () => void) => React.ReactNode;
    loadingMessage?: string;
    animation?: string;
    animationKey?: LoaderAnimationKey;
    customAnimation?: LoaderAnimationComponent;
    theme?: string;
    customLoader?: React.ReactNode;
    errorMessage?: string | ((error: any) => React.ReactNode);
    retryButtonText?: string;
    errorColor?: string;
    retryButtonStyle?: React.CSSProperties;
    a11yLabel?: string;
    a11yRole?: string;
    multiStage?: MultiStageLoadingConfig;
    progressiveFallback?: React.ReactNode;
    fallbackStrategy?: 'static' | 'simple' | 'none' | ((error: any) => React.ReactNode);
}
/**
 * Advanced network configuration for dynamic imports.
 */
interface AdvancedNetworkConfig {
    adjustRetry?: boolean;
    customNetworkInfo?: any;
}
/**
 * Advanced SSR configuration for dynamic imports.
 */
interface AdvancedSSRConfig {
    enabled?: boolean;
    fallback?: React.ReactNode;
}
type ImportFrom = 'local' | 'cdn' | 'remote' | string;
interface MockImportConfig {
    enabled?: boolean;
    mockImport?: () => Promise<any>;
}
/**
 * Main options object for retryDynamicImport and LazyLoader.
 */
interface RetryDynamicImportOptions {
    retry?: AdvancedRetryConfig;
    cache?: AdvancedCacheConfig;
    circuitBreaker?: AdvancedCircuitBreakerConfig;
    loader?: AdvancedLoaderConfig;
    ssr?: AdvancedSSRConfig;
    log?: AdvancedLogConfig;
    network?: AdvancedNetworkConfig;
    priority?: number;
    prefetch?: boolean;
    preload?: boolean;
    maxConcurrentLoads?: number;
    cacheBustingStrategy?: CacheBustingStrategy;
    suspense?: boolean;
    importFrom?: ImportFrom;
    mock?: MockImportConfig;
}
interface LoaderConfig {
    size?: number;
    borderSize?: number;
    color?: string;
    speed?: number;
    showRetries?: boolean;
    showNetworkInfo?: boolean;
    customStyle?: React.CSSProperties;
    errorFallback?: React.ReactNode;
}
type LoaderAnimationKey = string;
type LoaderAnimationComponent = React.FC<any>;
/**
 * LazyLoader: Advanced lazy loader with error handling, retry, and full customization.
 */
declare const LazyLoader: ({ importFunction, options, fallback, ...rest }: {
    [key: string]: any;
    importFunction: () => Promise<{
        default: ComponentType<any>;
    }>;
    options?: RetryDynamicImportOptions | undefined;
    fallback?: React.ReactNode;
}) => React.JSX.Element | null;
/**
 * retryDynamicImport: Advanced HOC for dynamic import with full configuration.
 * @param importFunction - The dynamic import function
 * @param options - Advanced options for retry, cache, loader, etc.
 * @returns React.FC<any>
 */
declare function retryDynamicImport(importFunction: () => Promise<{
    default: ComponentType<any>;
}>, options?: RetryDynamicImportOptions): React.FC<any>;
/**
 * prefetchDynamicImport: Advanced prefetch for dynamic import with options and strategies.
 * Supports: eager, idle, on-hover, on-visible
 */
declare const prefetchDynamicImport: (importFunction: () => Promise<any>, options?: {
    priority?: number | undefined;
    onSuccess?: (() => void) | undefined;
    onError?: ((err: any) => void) | undefined;
    cache?: {
        enabled?: boolean | undefined;
        key?: string | undefined;
    } | undefined;
    strategy?: PrefetchStrategy | undefined;
    elementRef?: React.RefObject<HTMLElement> | undefined;
} | undefined) => void;
/**
 * priorityLoadComponent: Advanced priority/delayed loader for dynamic import.
 */
declare const priorityLoadComponent: (importFunction: () => Promise<any>, options?: {
    priority?: number;
    delay?: number;
    queue?: boolean;
    maxConcurrent?: number;
    onLoad?: () => void;
}) => void;

export { LazyLoader, prefetchDynamicImport, priorityLoadComponent, retryDynamicImport };
