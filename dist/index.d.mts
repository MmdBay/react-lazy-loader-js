import React, { ReactNode, ComponentType } from 'react';

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
 * LFU (Least Frequently Used) cache implementation with TTL support.
 * Evicts the least frequently used items when capacity is reached.
 * Items also expire based on their Time To Live (TTL).
 */
declare class LFUCache<K, V> {
    private capacity;
    private cache;
    private ttl;
    private heap;
    constructor(capacity: number, ttl: number);
    /**
     * Retrieve an item from the cache. Updates frequency on access and removes expired items.
     */
    get(key: K): V | undefined;
    /**
     * Add or update an item in the cache. Evicts least frequently used item if at capacity.
     */
    set(key: K, value: V): void;
    /**
     * Remove the least frequently used item from the cache to make space for new items.
     */
    private evictLeastFrequentlyUsed;
}

type LoaderAnimation = 'spin' | 'dots' | 'wave' | 'bar' | 'pulse' | 'ripple' | 'square' | 'infinity' | 'cube' | 'spiral' | 'orbit' | 'bounce' | 'morph' | 'gradient-spin' | 'elastic' | 'flip' | 'scale' | 'particles' | 'neon';
interface LoaderLabels {
    retryLabel?: string;
    speedLabel?: string;
    typeLabel?: string;
    saveDataLabel?: string;
    saveDataOn?: string;
    saveDataOff?: string;
    gettingLabel?: string;
    percentLabel?: (progress: number) => string;
    messageLabel?: string;
    loadingLabel?: string;
    completedLabel?: string;
    errorLabel?: string;
}
interface LoaderProps {
    size?: number;
    borderSize?: number;
    color?: string;
    secondaryColor?: string;
    accentColor?: string;
    gradient?: string[];
    speed?: number;
    retries?: number;
    showRetries?: boolean;
    showNetworkInfo?: boolean;
    disableNetworkInfo?: boolean;
    customStyle?: React.CSSProperties;
    shadow?: string;
    glow?: boolean;
    glowIntensity?: number;
    animationType?: LoaderAnimation;
    icon?: ReactNode;
    progress?: number;
    message?: string;
    darkMode?: boolean;
    children?: ReactNode;
    labels?: LoaderLabels;
    blurBackground?: boolean;
    backdrop?: boolean;
    backdropOpacity?: number;
    font?: string;
    rounded?: boolean;
    floatingStyle?: boolean;
    pulseEffect?: boolean;
    glassmorphism?: boolean;
    neumorphism?: boolean;
    vibrantColors?: boolean;
    smoothTransitions?: boolean;
    microInteractions?: boolean;
    particleCount?: number;
    showLoadingText?: boolean;
    showPercentage?: boolean;
    audioFeedback?: boolean;
    hapticFeedback?: boolean;
    customTheme?: 'modern' | 'classic' | 'neon' | 'minimal' | 'gradient' | 'glass';
    autoHideDelay?: number;
    fadeInDuration?: number;
    scaleEffect?: boolean;
    rotationIntensity?: number;
    colorShift?: boolean;
    breathingEffect?: boolean;
    magneticEffect?: boolean;
    hoverEffects?: boolean;
    accessibility?: boolean;
    reducedMotion?: boolean;
    highContrast?: boolean;
}
declare const Loader: React.FC<LoaderProps>;

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
    shouldRetry?: (error: any) => boolean;
    backoffMultiplier?: number;
    jitter?: boolean;
}
type CacheType = 'lfu' | 'lru' | 'memory' | 'localStorage' | 'indexeddb' | 'custom';
interface AdvancedCacheConfig {
    enabled?: boolean;
    customCache?: LFUCache<string, any> | any;
    key?: (importFn: () => Promise<any>) => string;
    keyGenerator?: (importFn: () => Promise<any>) => string;
    maxAge?: number;
    maxSize?: number;
    type?: CacheType;
    storage?: any;
    onHit?: (key: string) => void;
    onMiss?: (key: string) => void;
    onEvict?: (key: string, value: any) => void;
}
/**
 * Advanced circuit breaker configuration for dynamic imports.
 */
interface AdvancedCircuitBreakerConfig {
    enabled?: boolean;
    threshold?: number;
    resetTime?: number;
    customStrategy?: (failures: number, lastError: any) => boolean;
    failureThreshold?: number;
    recoveryTimeout?: number;
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
    level?: 'debug' | 'info' | 'warn' | 'error';
    events?: string[];
    logger?: (event: string, data: any) => void;
    telemetryHook?: TelemetryHook;
}
interface MultiStageLoadingConfig {
    skeleton?: React.ReactNode;
    spinner?: React.ReactNode;
    delay?: number;
    transition?: string;
}
/**
 * Advanced loader configuration for LazyLoader.
 */
interface AdvancedLoaderConfig {
    size?: number;
    borderSize?: number;
    color?: string;
    secondaryColor?: string;
    accentColor?: string;
    gradient?: string[];
    speed?: number;
    showRetries?: boolean;
    showNetworkInfo?: boolean;
    disableNetworkInfo?: boolean;
    component?: React.ReactNode;
    fallback?: React.ReactNode;
    errorFallback?: (error: any, retry: () => void) => React.ReactNode;
    loadingMessage?: string;
    animation?: string;
    animationType?: LoaderAnimation;
    animationKey?: LoaderAnimationKey;
    customAnimation?: LoaderAnimationComponent$1;
    theme?: string;
    customTheme?: 'modern' | 'classic' | 'neon' | 'minimal' | 'gradient' | 'glass';
    glow?: boolean;
    glowIntensity?: number;
    shadow?: string;
    pulse?: boolean;
    pulseEffect?: boolean;
    glassmorphism?: boolean;
    neumorphism?: boolean;
    vibrantColors?: boolean;
    smoothTransitions?: boolean;
    microInteractions?: boolean;
    scaleEffect?: boolean;
    colorShift?: boolean;
    breathingEffect?: boolean;
    magneticEffect?: boolean;
    hoverEffects?: boolean;
    floatingStyle?: boolean;
    showLoadingText?: boolean;
    showPercentage?: boolean;
    progress?: number;
    message?: string;
    icon?: React.ReactNode;
    particleCount?: number;
    className?: string;
    style?: React.CSSProperties;
    customStyle?: React.CSSProperties;
    font?: string;
    rounded?: boolean;
    darkMode?: boolean;
    backdrop?: boolean;
    backdropOpacity?: number;
    blurBackground?: boolean;
    accessibility?: boolean;
    reducedMotion?: boolean;
    highContrast?: boolean;
    a11yLabel?: string;
    a11yRole?: string;
    autoHideDelay?: number;
    fadeInDuration?: number;
    customLoader?: React.ReactNode;
    errorMessage?: string | ((error: any) => React.ReactNode);
    retryButtonText?: string;
    errorColor?: string;
    retryButtonStyle?: React.CSSProperties;
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
    adaptive?: boolean;
    speedThreshold?: number;
    compression?: boolean;
    preload?: string | null;
}
interface MemoryConfig {
    cleanup?: boolean;
    maxAge?: number;
    onCleanup?: (key: string) => void;
}
interface ProgressiveConfig {
    enabled?: boolean;
    fallback?: React.ReactNode;
    strategy?: string;
}
interface BatchingConfig {
    enabled?: boolean;
    maxConcurrent?: number;
    batchSize?: number;
    delay?: number;
}
interface AccessibilityConfig {
    label?: string;
    role?: string;
    live?: string;
    describedBy?: string | null;
}
/**
 * Advanced SSR configuration for dynamic imports.
 */
interface AdvancedSSRConfig {
    enabled?: boolean;
    fallback?: React.ReactNode;
    suspense?: boolean;
    preload?: boolean;
}
type ImportFrom = 'local' | 'cdn' | 'remote' | string | {
    type?: string;
    baseUrl?: string;
    fallback?: string;
};
interface MockImportConfig {
    enabled?: boolean;
    mockImport?: () => Promise<any>;
    delay?: number;
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
    memory?: MemoryConfig;
    progressive?: ProgressiveConfig;
    batching?: BatchingConfig;
    a11y?: AccessibilityConfig;
    priority?: number;
    prefetch?: boolean;
    preload?: boolean;
    maxConcurrentLoads?: number;
    cacheBustingStrategy?: CacheBustingStrategy;
    suspense?: boolean;
    importFrom?: ImportFrom;
    mock?: MockImportConfig;
}
interface UseRetryDynamicImportResult {
    Component: React.LazyExoticComponent<ComponentType<any>>;
    retryCount: number;
    error: Error | null;
    reset: () => void;
}
declare const LazyLoaderProvider: React.FC<{
    value: Partial<RetryDynamicImportOptions>;
    children: React.ReactNode;
}>;
/**
 * useRetryDynamicImport: Advanced hook for dynamic import with retry, cache, circuit breaker, and more.
 * Now supports context-aware config.
 */
declare function useRetryDynamicImport(importFunction: () => Promise<{
    default: ComponentType<any>;
}>, options?: RetryDynamicImportOptions): UseRetryDynamicImportResult;
type LoaderTheme = 'light' | 'dark' | 'system' | string;
declare const LoaderThemeProvider: React.FC<{
    value: LoaderTheme;
    children: React.ReactNode;
}>;
type LoaderAnimationKey = string;
type LoaderAnimationComponent$1 = React.FC<any>;
interface LoaderAnimationRegistryType {
    [key: string]: LoaderAnimationComponent$1;
}
declare const LoaderAnimationRegistryProvider: React.FC<{
    value: LoaderAnimationRegistryType;
    children: React.ReactNode;
}>;
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
    threshold?: number | undefined;
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

/**
 * Simple telemetry hook for logging loader-related events.
 * The implementation is intentionally lightweight – it just stores
 * the events in a ref so the caller can later inspect them via
 * `getMetrics`. It’s mainly provided so the public API surface
 * matches the README examples.
 */
declare function useLoaderTelemetry(): {
    logEvent: (event: string, data?: any) => void;
    getMetrics: () => {
        event: string;
        data?: any;
        timestamp: number;
    }[];
};
interface LoaderThemeDefinition {
    name: string;
    colors?: Record<string, string>;
    styles?: Record<string, string>;
    [key: string]: any;
}
/**
 * Register a custom loader theme so it can be referenced by name.
 */
declare function registerLoaderTheme(theme: LoaderThemeDefinition): void;
type LoaderAnimationComponent = React.FC<any>;
/**
 * Register a custom animation component under a key.
 */
declare function registerLoaderAnimation(key: string, component: LoaderAnimationComponent): void;
interface CustomCache<K = any, V = any> {
    get: (key: K) => V | undefined;
    set: (key: K, value: V, options?: any) => void;
    delete: (key: K) => void;
    clear: () => void;
}
/**
 * Thin helper that simply returns the user-supplied implementation. It exists
 * so consumers can provide their own cache object but still use a strongly‐typed
 * factory consistent with the README.
 */
declare function createCustomCache<K = any, V = any>(impl: CustomCache<K, V>): CustomCache<K, V>;
interface LazyLoaderErrorBoundaryProps {
    /**
     * Fallback render prop called with the thrown error and a `retry` callback.
     */
    fallback: (error: Error, retry: () => void) => React.ReactNode;
    children: React.ReactNode;
}
interface LazyLoaderErrorBoundaryState {
    error: Error | null;
}
/**
 * A very small ErrorBoundary that matches the README API. It re-renders the
 * fallback when an error occurs and exposes a retry callback that resets the
 * internal error state so the children can attempt to render again.
 */
declare class LazyLoaderErrorBoundary extends React.Component<LazyLoaderErrorBoundaryProps, LazyLoaderErrorBoundaryState> {
    constructor(props: LazyLoaderErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): LazyLoaderErrorBoundaryState;
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    retry(): void;
    render(): React.ReactNode;
}

export { LazyLoader, LazyLoaderErrorBoundary, LazyLoaderProvider, Loader, type LoaderAnimation, LoaderAnimationRegistryProvider, type LoaderLabels, type LoaderProps, LoaderThemeProvider, createCustomCache, prefetchDynamicImport, priorityLoadComponent, registerLoaderAnimation, registerLoaderTheme, retryDynamicImport, useLoaderTelemetry, useRetryDynamicImport };
