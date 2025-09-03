import { getNetworkInfo, getNetworkInfoSync } from './networkSpeed';
import React, {
  ComponentType,
  lazy,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  Suspense,
  createContext,
  useContext
} from 'react';
import { getConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { LFUCache } from './cache';
import { CircuitBreaker } from './circuitBreaker';
import Loader, { LoaderAnimation } from './LoadingSpinner';
import { LazyLoaderErrorBoundary } from './extras';

const defaultLFUCache = new LFUCache<string, any>(5, 3600000);

// --- Types for advanced config ---
export type RetryStrategy = 'exponential' | 'linear' | ((retry: number, error: any) => number);
export type CacheBustingStrategy = 'query' | 'hash';
export type PrefetchStrategy = 'eager' | 'idle' | 'on-hover' | 'on-visible';

/**
 * Advanced retry configuration for dynamic imports.
 */
export interface AdvancedRetryConfig extends Partial<RetryConfig> {
  strategy?: RetryStrategy; // Retry strategy: exponential, linear, or custom function
  customDelayFn?: (retry: number, error: any) => number; // Custom delay function
  onRetry?: (retry: number, error: any) => void; // Callback on each retry
  onSuccess?: (module: any) => void; // Callback on success
  onError?: (error: any) => void; // Callback on error
  retryCondition?: (error: any) => boolean; // Custom retry condition
  // ------ Aliases / Extras to match README ------
  shouldRetry?: (error: any) => boolean; // Alias for retryCondition used in README examples
  backoffMultiplier?: number; // Custom back-off base for exponential strategy (default 2)
  jitter?: boolean; // Whether to add random jitter to delays
}

// --- Advanced Cache Types ---
export type CacheType = 'lfu' | 'lru' | 'memory' | 'localStorage' | 'indexeddb' | 'custom';

export interface AdvancedCacheConfig {
  enabled?: boolean;
  customCache?: LFUCache<string, any> | any;
  key?: (importFn: () => Promise<any>) => string;
  keyGenerator?: (importFn: () => Promise<any>) => string; // alias for key (docs)
  maxAge?: number;
  maxSize?: number; // Maximum number of cached items
  type?: CacheType;
  storage?: any;
  onHit?: (key: string) => void;
  onMiss?: (key: string) => void;
  onEvict?: (key: string, value: any) => void;
}

/**
 * Advanced circuit breaker configuration for dynamic imports.
 */
export interface AdvancedCircuitBreakerConfig {
  enabled?: boolean; // Enable/disable circuit breaker
  threshold?: number; // Failure threshold
  resetTime?: number; // Reset time in ms
  customStrategy?: (failures: number, lastError: any) => boolean; // Custom circuit breaker strategy
  // Aliases to align with README examples
  failureThreshold?: number;
  recoveryTimeout?: number;
}

// --- Telemetry/Logging ---
export interface TelemetryEvent {
  type: string;
  data?: any;
  timestamp: number;
}
export type TelemetryHook = (event: TelemetryEvent) => void;

/**
 * Advanced logging configuration for dynamic imports.
 */
export interface AdvancedLogConfig {
  enabled?: boolean; // Enable/disable logging
  level?: 'debug' | 'info' | 'warn' | 'error';
  events?: string[];
  logger?: (event: string, data: any) => void; // Custom logger function
  telemetryHook?: TelemetryHook;
}

// --- Multi-Stage Loading ---
export interface MultiStageLoadingConfig {
  skeleton?: React.ReactNode;
  spinner?: React.ReactNode;
  delay?: number; // ms before showing spinner
  transition?: string; // Transition style (placeholder for future use)
}

/**
 * Advanced loader configuration for LazyLoader.
 */
export interface AdvancedLoaderConfig {
  // Basic properties
  size?: number;
  borderSize?: number;
  color?: string;
  secondaryColor?: string;
  accentColor?: string;
  gradient?: string[];
  speed?: number;
  showRetries?: boolean;
  showNetworkInfo?: boolean;
  disableNetworkInfo?: boolean; // For testing purposes
  
  // Component and fallback options
  component?: React.ReactNode; // Custom loader component
  fallback?: React.ReactNode; // Custom fallback
  errorFallback?: (error: any, retry: () => void) => React.ReactNode; // Custom error fallback
  loadingMessage?: string; // Custom loading message
  
  // Animation and theme
  animation?: string; // Loader animation type (alias for animationType)
  animationType?: LoaderAnimation; // Loader animation type
  animationKey?: LoaderAnimationKey;
  customAnimation?: LoaderAnimationComponent;
  theme?: string; // Loader theme
  customTheme?: 'modern' | 'classic' | 'neon' | 'minimal' | 'gradient' | 'glass';
  
  // Visual effects
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
  
  // Display options
  showLoadingText?: boolean;
  showPercentage?: boolean;
  progress?: number;
  message?: string;
  icon?: React.ReactNode;
  particleCount?: number;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  customStyle?: React.CSSProperties; // alias for style used in earlier code
  font?: string;
  rounded?: boolean;
  darkMode?: boolean;
  
  // Backdrop and layout
  backdrop?: boolean;
  backdropOpacity?: number;
  blurBackground?: boolean;
  
  // Accessibility
  accessibility?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
  a11yLabel?: string;
  a11yRole?: string;
  
  // Behavior
  autoHideDelay?: number;
  fadeInDuration?: number;
  
  // Error handling
  customLoader?: React.ReactNode; // Custom loader node
  errorMessage?: string | ((error: any) => React.ReactNode); // Custom error message
  retryButtonText?: string; // Custom retry button text
  errorColor?: string; // Custom error color
  retryButtonStyle?: React.CSSProperties; // Custom retry button style
  
  // Advanced features
  multiStage?: MultiStageLoadingConfig;
  progressiveFallback?: React.ReactNode; // Fallback for progressive enhancement
  fallbackStrategy?: 'static' | 'simple' | 'none' | ((error: any) => React.ReactNode);
}

/**
 * Advanced network configuration for dynamic imports.
 */
export interface AdvancedNetworkConfig {
  adjustRetry?: boolean; // Adjust retry based on network
  customNetworkInfo?: any; // Custom network info
  // Extra optional fields for future network optimisation features referenced in the docs
  adaptive?: boolean;
  speedThreshold?: number;
  compression?: boolean;
  preload?: string | null;
}

// --- Memory management (placeholder) ---
export interface MemoryConfig {
  cleanup?: boolean;
  maxAge?: number;
  onCleanup?: (key: string) => void;
}

// --- Progressive enhancement (placeholder) ---
export interface ProgressiveConfig {
  enabled?: boolean;
  fallback?: React.ReactNode;
  strategy?: string;
}

// --- Batching & concurrency (placeholder) ---
export interface BatchingConfig {
  enabled?: boolean;
  maxConcurrent?: number;
  batchSize?: number;
  delay?: number;
}

// --- Accessibility (placeholder) ---
export interface AccessibilityConfig {
  label?: string;
  role?: string;
  live?: string;
  describedBy?: string | null;
}

/**
 * Advanced SSR configuration for dynamic imports.
 */
export interface AdvancedSSRConfig {
  enabled?: boolean; // Enable/disable SSR
  fallback?: React.ReactNode; // SSR fallback
  suspense?: boolean; // Whether to wrap in React.Suspense on server (placeholder for docs)
  preload?: boolean; // Whether to preload component on server (placeholder for docs)
}

// --- Remote/CDN Import Support ---
export type ImportFrom = 'local' | 'cdn' | 'remote' | string | {
  type?: string;
  baseUrl?: string;
  fallback?: string;
};

// --- Mock/Test API ---
export interface MockImportConfig {
  enabled?: boolean;
  mockImport?: () => Promise<any>;
  delay?: number;
}

/**
 * Main options object for retryDynamicImport and LazyLoader.
 */
export interface RetryDynamicImportOptions {
  // Core
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
  suspense?: boolean; // If false, disables React.Suspense and uses fallback/loader directly
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
  disableNetworkInfo?: boolean;
  customStyle?: React.CSSProperties;
  errorFallback?: React.ReactNode;
}

interface UseRetryDynamicImportResult {
  Component: React.LazyExoticComponent<ComponentType<any>>;
  retryCount: number;
  error: Error | null;
  reset: () => void;
}

// --- Context for global config ---
export const LazyLoaderContext = createContext<Partial<RetryDynamicImportOptions>>({});

export const LazyLoaderProvider: React.FC<{
  value: Partial<RetryDynamicImportOptions>;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <LazyLoaderContext.Provider value={value}>{children}</LazyLoaderContext.Provider>
);

export function useMergedOptions(options?: RetryDynamicImportOptions): RetryDynamicImportOptions {
  const contextOptions = useContext(LazyLoaderContext);
  return { ...(contextOptions || {}), ...(options || {}) };
}

// --- Advanced useRetryDynamicImport hook ---
/**
 * useRetryDynamicImport: Advanced hook for dynamic import with retry, cache, circuit breaker, and more.
 * Now supports context-aware config.
 */
export function useRetryDynamicImport(
  importFunction: () => Promise<any>,
  options: RetryDynamicImportOptions = {}
): UseRetryDynamicImportResult {
  const mergedOptions = useMergedOptions(options);
  const retryConfig = getConfig(mergedOptions.retry || {});
  // ------- Resolve README aliases -------
  const retryOpts = mergedOptions.retry || {};
  const effectiveRetryCondition = retryOpts.retryCondition || retryOpts.shouldRetry;
  const backoffMultiplier = retryOpts.backoffMultiplier ?? 2;
  const useJitter = retryOpts.jitter === true;
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cbOverrides = mergedOptions.circuitBreaker || {};
  const circuitBreakerConfig = {
    ...retryConfig,
    ...cbOverrides,
    ...(cbOverrides.failureThreshold !== undefined ? { circuitBreakerThreshold: cbOverrides.failureThreshold } : {}),
    ...(cbOverrides.recoveryTimeout !== undefined ? { resetTimeMs: cbOverrides.recoveryTimeout } : {}),
    ...(cbOverrides.threshold !== undefined ? { circuitBreakerThreshold: cbOverrides.threshold } : {}),
    ...(cbOverrides.resetTime !== undefined ? { resetTimeMs: cbOverrides.resetTime } : {})
  };
  const circuitBreaker = useRef(new CircuitBreaker(circuitBreakerConfig));
  
  // Create cache with custom options or use default
  const cache = useMemo(() => {
    if (mergedOptions.cache?.customCache) {
      return mergedOptions.cache.customCache;
    }
    
    const cacheOptions = mergedOptions.cache || {};
    const maxSize = cacheOptions.maxSize || 50;
    const maxAge = cacheOptions.maxAge || 3600000;
    
    return new LFUCache<string, any>(maxSize, maxAge);
  }, [mergedOptions.cache]);
  const cacheKey = mergedOptions.cache?.key
    ? mergedOptions.cache.key(importFunction)
    : mergedOptions.cache?.keyGenerator
      ? mergedOptions.cache.keyGenerator(importFunction)
      : getRouteComponentUrl(importFunction);

  const loadComponent = useCallback(async (): Promise<any> => {
    let hasTimedOut = false;
    const { maxRetryCount, timeoutMs } = retryConfig;
    let effectiveType = 'unknown', downlink = 0;
    if (mergedOptions.network?.customNetworkInfo) {
      effectiveType = mergedOptions.network.customNetworkInfo.effectiveType;
      downlink = mergedOptions.network.customNetworkInfo.downlink;
    } else {
      const info = await getNetworkInfo();
      effectiveType = info.effectiveType;
      downlink = info.downlink;
    }
    let adjustedRetryCount = maxRetryCount;
    let adjustedDelay = retryConfig.initialRetryDelayMs;
    if (mergedOptions.network?.adjustRetry !== false) {
      if (downlink < 1 || effectiveType.includes('2g')) {
        adjustedRetryCount = maxRetryCount * 2;
        adjustedDelay = retryConfig.initialRetryDelayMs * 2;
      }
    }
    if (typeof retryOpts.customDelayFn === 'function') {
      adjustedDelay = retryOpts.customDelayFn(retryCount, error);
    }
    if (typeof retryOpts.strategy === 'function') {
      adjustedDelay = retryOpts.strategy(retryCount, error) as number;
    } else if (retryOpts.strategy === 'exponential') {
      adjustedDelay = retryConfig.initialRetryDelayMs * Math.pow(backoffMultiplier, retryCount);
    } else if (retryOpts.strategy === 'linear') {
      adjustedDelay = retryConfig.initialRetryDelayMs * (retryCount + 1);
    }
    // Apply jitter if requested
    if (useJitter) {
      const jitterFactor = Math.random() * 0.4 + 0.8; // 0.8 – 1.2
      adjustedDelay = adjustedDelay * jitterFactor;
    }
    const importUrl = cacheKey;
    const cachedComponent = importUrl ? cache.get(importUrl) : null;
    if (cachedComponent) return Promise.resolve(cachedComponent);

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    // --- Mock/Test support ---
    if (mergedOptions.mock?.enabled && mergedOptions.mock.mockImport) {
      return mergedOptions.mock.mockImport();
    }

    // --- Remote/CDN import support ---
    let actualImportFunction = importFunction;
    const importFromConfig = mergedOptions.importFrom;
    const importType = typeof importFromConfig === 'string'
      ? importFromConfig
      : importFromConfig?.type;
    
    if (importType && importType !== 'local') {
      const baseUrl = typeof importFromConfig === 'object' ? importFromConfig.baseUrl : '';
      const fallback = typeof importFromConfig === 'object' ? importFromConfig.fallback : 'local';
      
      actualImportFunction = async () => {
        try {
          // For CDN/remote imports, we need to dynamically load the script
          if (importType === 'cdn' && baseUrl) {
            const moduleUrl = `${baseUrl}/${getRouteComponentUrl(importFunction)}`;
            
            // Create a dynamic import from the remote URL
            const remoteModule = await import(/* webpackIgnore: true */ moduleUrl);
            return remoteModule;
          }
          
          // For other remote types, use the original function
          return await importFunction();
        } catch (error) {
          // Fallback to local import if remote fails
          if (fallback === 'local') {
            console.warn('Remote import failed, falling back to local:', error);
            return await importFunction();
          }
          throw error;
        }
      };
    }

    // --- Batching/Concurrency ---
    const maxConcurrent = mergedOptions.maxConcurrentLoads || 4;
    return new Promise<any>((resolve, reject) => {
      enqueueLoad(() => {
        const timeoutId = setTimeout(() => {
          hasTimedOut = true;
          dequeueLoad();
          reject(new Error('Component load timed out.'));
        }, timeoutMs);

        function tryLoadComponent(currentRetry: number) {
          if (hasTimedOut || signal.aborted) {
            clearTimeout(timeoutId);
            dequeueLoad();
            reject(new Error('Component load aborted.'));
            return;
          }
          const retryImport = getRetryImportFunction(actualImportFunction, currentRetry);
          retryImport()
            .then((module) => {
              clearTimeout(timeoutId);
              // Validate module shape for React.lazy
              const isValidModule = module && typeof module === 'object' && 'default' in module && module.default;
              if (!isValidModule) {
                throw new Error('Invalid module from dynamic import: missing default export');
              }
              if (importUrl) cache.set(importUrl, module);
              mergedOptions.retry?.onSuccess?.(module);
              dequeueLoad();
              resolve(module);
            })
            .catch((err) => {
              mergedOptions.retry?.onRetry?.(currentRetry, err);
              if (circuitBreaker.current.handleFailure()) {
                clearTimeout(timeoutId);
                mergedOptions.retry?.onError?.(err);
                dequeueLoad();
                reject(err);
                return;
              }
              if (typeof effectiveRetryCondition === 'function' && !effectiveRetryCondition(err)) {
                clearTimeout(timeoutId);
                mergedOptions.retry?.onError?.(err);
                dequeueLoad();
                reject(err);
                return;
              }
              if (currentRetry < adjustedRetryCount) {
                setTimeout(() => tryLoadComponent(currentRetry + 1), (currentRetry + 1) * adjustedDelay);
              } else {
                clearTimeout(timeoutId);
                mergedOptions.retry?.onError?.(err);
                dequeueLoad();
                reject(err);
              }
            });
        }
        tryLoadComponent(0);
      }, maxConcurrent);
    });
  }, [importFunction, retryConfig, mergedOptions, retryCount, error]);

  const [Component, setComponent] = useState<React.LazyExoticComponent<ComponentType<any>>>(() => lazy(loadComponent));

  // Reset logic for manual retry
  const reset = useCallback(() => {
    setRetryCount(0);
    setError(null);
    setComponent(() => lazy(loadComponent));
  }, [loadComponent]);

  // Error boundary for lazy
  const LazyWithErrorBoundary = React.useMemo(() => {
    return React.lazy(() =>
      loadComponent()
        .then((mod) => {
          setError(null);
          return mod;
        })
        .catch((err) => {
          setRetryCount((c) => c + 1);
          setError(err);
          throw err;
        })
    );
  }, [loadComponent]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { Component: LazyWithErrorBoundary, retryCount, error, reset };
}

// --- Theme Context for Loader ---
export type LoaderTheme = 'light' | 'dark' | 'system' | string;
export const LoaderThemeContext = createContext<LoaderTheme>('light');

export const LoaderThemeProvider: React.FC<{
  value: LoaderTheme;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <LoaderThemeContext.Provider value={value}>{children}</LoaderThemeContext.Provider>
);

function useLoaderTheme(theme?: LoaderTheme) {
  const contextTheme = useContext(LoaderThemeContext);
  return theme || contextTheme || 'light';
}

// --- Animation Registry for Loader ---
export type LoaderAnimationKey = string;
export type LoaderAnimationComponent = React.FC<any>;

export interface LoaderAnimationRegistryType {
  [key: string]: LoaderAnimationComponent;
}

export const LoaderAnimationRegistryContext = createContext<LoaderAnimationRegistryType>({});

export const LoaderAnimationRegistryProvider: React.FC<{
  value: LoaderAnimationRegistryType;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <LoaderAnimationRegistryContext.Provider value={value}>{children}</LoaderAnimationRegistryContext.Provider>
);

function useLoaderAnimation(animationKey?: LoaderAnimationKey, customAnimation?: LoaderAnimationComponent) {
  const registry = useContext(LoaderAnimationRegistryContext);
  if (customAnimation) return customAnimation;
  if (animationKey && registry[animationKey]) return registry[animationKey];
  return undefined;
}

/**
 * LazyLoader: Advanced lazy loader with error handling, retry, and full customization.
 */
export const LazyLoader = ({
  importFunction,
  options = {},
  fallback,
  ...rest
}: {
  importFunction: () => Promise<any>;
  options?: RetryDynamicImportOptions;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  const mergedOptions = useMergedOptions(options);
  const { Component, retryCount, error, reset } = useRetryDynamicImport(importFunction, mergedOptions);
  const loaderConfig = mergedOptions.loader || {};
  const theme = useLoaderTheme(loaderConfig.theme);
  const AnimationComponent = useLoaderAnimation(loaderConfig.animationKey, loaderConfig.customAnimation);
  const loaderProps = {
    retries: retryCount,
    size: loaderConfig.size,
    borderSize: loaderConfig.borderSize,
    color: loaderConfig.color,
    secondaryColor: loaderConfig.secondaryColor,
    accentColor: loaderConfig.accentColor,
    gradient: loaderConfig.gradient,
    speed: loaderConfig.speed,
    showRetries: loaderConfig.showRetries,
    showNetworkInfo: loaderConfig.showNetworkInfo,
    disableNetworkInfo: loaderConfig.disableNetworkInfo,
    customStyle: loaderConfig.customStyle || loaderConfig.style,
    shadow: loaderConfig.shadow,
    glow: loaderConfig.glow,
    glowIntensity: loaderConfig.glowIntensity,
    // Use animationType if available, otherwise fall back to animation
    animationType: (loaderConfig.animationType || loaderConfig.animation) as any,
    icon: loaderConfig.icon,
    progress: loaderConfig.progress,
    message: loaderConfig.message || loaderConfig.loadingMessage,
    darkMode: loaderConfig.darkMode || theme === 'dark',
    labels: {},
    blurBackground: loaderConfig.blurBackground,
    backdrop: loaderConfig.backdrop,
    backdropOpacity: loaderConfig.backdropOpacity,
    font: loaderConfig.font,
    rounded: loaderConfig.rounded,
    floatingStyle: loaderConfig.floatingStyle,
    pulseEffect: loaderConfig.pulseEffect || loaderConfig.pulse,
    glassmorphism: loaderConfig.glassmorphism,
    neumorphism: loaderConfig.neumorphism,
    vibrantColors: loaderConfig.vibrantColors,
    smoothTransitions: loaderConfig.smoothTransitions,
    microInteractions: loaderConfig.microInteractions,
    particleCount: loaderConfig.particleCount,
    showLoadingText: loaderConfig.showLoadingText,
    showPercentage: loaderConfig.showPercentage,
    customTheme: loaderConfig.customTheme,
    autoHideDelay: loaderConfig.autoHideDelay,
    fadeInDuration: loaderConfig.fadeInDuration,
    scaleEffect: loaderConfig.scaleEffect,
    colorShift: loaderConfig.colorShift,
    breathingEffect: loaderConfig.breathingEffect,
    magneticEffect: loaderConfig.magneticEffect,
    hoverEffects: loaderConfig.hoverEffects,
    accessibility: loaderConfig.accessibility,
    reducedMotion: loaderConfig.reducedMotion,
    highContrast: loaderConfig.highContrast,
    'aria-label': loaderConfig.a11yLabel,
    role: loaderConfig.a11yRole || 'status',
  };

  // Multi-stage loading: skeleton -> spinner -> content
  const [showSpinner, setShowSpinner] = useState(!loaderConfig.multiStage?.skeleton);
  useEffect(() => {
    if (loaderConfig.multiStage?.skeleton && loaderConfig.multiStage.delay) {
      setShowSpinner(false);
      const timer = setTimeout(() => setShowSpinner(true), loaderConfig.multiStage.delay);
      return () => clearTimeout(timer);
    } else if (loaderConfig.multiStage?.skeleton) {
      setShowSpinner(false);
      setTimeout(() => setShowSpinner(true), 300);
    }
  }, [loaderConfig.multiStage]);

  // SSR/SSG support: If window is undefined, render SSR fallback or progressive fallback
  if (typeof window === 'undefined') {
    if (loaderConfig.fallbackStrategy === 'static' && loaderConfig.progressiveFallback) {
      return <>{loaderConfig.progressiveFallback}</>;
    }
    const ssrFallback = mergedOptions.ssr?.fallback;
    if (ssrFallback !== undefined && ssrFallback !== null) {
      return <>{ssrFallback}</>;
    }
    return null;
  }

  if (error) {
    if (typeof loaderConfig.errorFallback === 'function') {
      return <>{loaderConfig.errorFallback(error, reset)}</>;
    }
    if (typeof loaderConfig.fallbackStrategy === 'function') {
      return <>{loaderConfig.fallbackStrategy(error)}</>;
    }
    if (loaderConfig.fallbackStrategy === 'static' && loaderConfig.progressiveFallback) {
      return <>{loaderConfig.progressiveFallback}</>;
    }
    if (loaderConfig.fallbackStrategy === 'simple') {
      let msg: React.ReactNode = 'Failed to load.';
      if (typeof loaderConfig.errorMessage === 'function') {
        msg = loaderConfig.errorMessage(error);
      } else if (typeof loaderConfig.errorMessage === 'string') {
        msg = loaderConfig.errorMessage;
      }
      return <div>{msg}</div>;
    }
    if (loaderConfig.fallbackStrategy === 'none') {
      return null;
    }
    return loaderConfig.fallback ? (
      <>{loaderConfig.fallback}</>
    ) : (
      <div style={{ textAlign: 'center', padding: 24 }} role="alert" aria-live="assertive">
        <div style={{ color: loaderConfig.errorColor || 'red', marginBottom: 8 }}>
          {loaderConfig.errorMessage
            ? (typeof loaderConfig.errorMessage === 'function'
                ? loaderConfig.errorMessage(error)
                : loaderConfig.errorMessage)
            : `Error loading component: ${error.message}`}
        </div>
        <button
          onClick={reset}
          style={loaderConfig.retryButtonStyle || { padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
          aria-label={loaderConfig.retryButtonText || 'Retry'}
        >
          {loaderConfig.retryButtonText || 'Retry'}
        </button>
      </div>
    );
  }

  // Suspense-less loading support
  if (mergedOptions.suspense === false) {
    if (loaderConfig.multiStage?.skeleton && !showSpinner) {
      return <>{loaderConfig.multiStage.skeleton}</>;
    }
    if (AnimationComponent) return <AnimationComponent {...loaderProps} />;
    return <>{loaderConfig.customLoader ?? fallback ?? <Loader {...loaderProps} />}</>;
  }

  // Telemetry/logging example (can be expanded)
  useEffect(() => {
    if (mergedOptions.log?.enabled && mergedOptions.log.telemetryHook) {
      mergedOptions.log.telemetryHook({ type: 'mount', timestamp: Date.now() });
    }
    return () => {
      if (mergedOptions.log?.enabled && mergedOptions.log.telemetryHook) {
        mergedOptions.log.telemetryHook({ type: 'unmount', timestamp: Date.now() });
      }
    };
  }, []);

  return (
    <Suspense fallback={
      loaderConfig.multiStage?.skeleton && !showSpinner
        ? loaderConfig.multiStage.skeleton
        : (AnimationComponent
            ? <AnimationComponent {...loaderProps} />
            : (fallback || loaderConfig.customLoader || <Loader {...loaderProps} />))
    }>
      <LazyLoaderErrorBoundary
        fallback={(err: Error, retryFn: () => void) => {
          if (typeof loaderConfig.errorFallback === 'function') {
            return <>{loaderConfig.errorFallback(err, retryFn)}</>;
          }
          if (typeof loaderConfig.fallbackStrategy === 'function') {
            return <>{loaderConfig.fallbackStrategy(err)}</>;
          }
          // Default simple fallback
          return (
            <div style={{ textAlign: 'center', padding: 24 }} role="alert" aria-live="assertive">
              <div style={{ color: loaderConfig.errorColor || 'red', marginBottom: 8 }}>
                {`Error loading component: ${err.message}`}
              </div>
              <button
                onClick={retryFn}
                style={loaderConfig.retryButtonStyle || { padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}
                aria-label={loaderConfig.retryButtonText || 'Retry'}
              >
                {loaderConfig.retryButtonText || 'Retry'}
              </button>
            </div>
          );
        }}
      >
        {/* Guard against invalid lazy component modules during tests/mocks */}
        {Component ? <Component {...rest} /> : null}
      </LazyLoaderErrorBoundary>
    </Suspense>
  );
};

/**
 * retryDynamicImport: Advanced HOC for dynamic import with full configuration.
 * @param importFunction - The dynamic import function
 * @param options - Advanced options for retry, cache, loader, etc.
 * @returns React.FC<any>
 */
export function retryDynamicImport(
  importFunction: () => Promise<any>,
  options?: RetryDynamicImportOptions
): React.FC<any> {
  return (props: any) => (
    <LazyLoader
      importFunction={importFunction}
      options={options}
      {...props}
    />
  );
}

/**
 * prefetchDynamicImport: Advanced prefetch for dynamic import with options and strategies.
 * Supports: eager, idle, on-hover, on-visible
 */
export const prefetchDynamicImport = (
  importFunction: () => Promise<any>,
  options?: {
    priority?: number;
    onSuccess?: () => void;
    onError?: (err: any) => void;
    cache?: { enabled?: boolean; key?: string };
    strategy?: PrefetchStrategy;
    elementRef?: React.RefObject<HTMLElement>;
    threshold?: number; // <--- new option
  }
) => {
  // Eager: prefetch immediately
  if (!options?.strategy || options.strategy === 'eager') {
    const retryImport = getRetryImportFunction(importFunction, 0);
    retryImport()
      .then((module) => {
        options?.onSuccess?.();
        if (options?.cache?.enabled && options?.cache?.key) {
          defaultLFUCache.set(options.cache.key, module);
        }
      })
      .catch((error) => {
        options?.onError?.(error);
      });
    return;
  }
  // Idle: prefetch when browser is idle
  if (options.strategy === 'idle' && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => prefetchDynamicImport(importFunction, { ...options, strategy: 'eager' }));
    return;
  }
  // On-hover: prefetch when element is hovered
  if (options.strategy === 'on-hover' && options.elementRef?.current) {
    const el = options.elementRef.current;
    const handler = () => prefetchDynamicImport(importFunction, { ...options, strategy: 'eager' });
    el.addEventListener('mouseenter', handler, { once: true });
    return;
  }
  // On-visible: prefetch when element is visible (IntersectionObserver)
  if (options.strategy === 'on-visible' && options.elementRef?.current && typeof window !== 'undefined') {
    const el = options.elementRef.current;
    const observer = new window.IntersectionObserver((entries, obs) => {
      if (entries.some(e => e.isIntersecting)) {
        prefetchDynamicImport(importFunction, { ...options, strategy: 'eager' });
        obs.disconnect();
      }
    }, { threshold: options.threshold ?? 0 }); // <--- pass threshold
    observer.observe(el);
    return;
  }
};

/**
 * priorityLoadComponent: Advanced priority/delayed loader for dynamic import.
 */
export const priorityLoadComponent = (
  importFunction: () => Promise<any>,
  options?: {
    priority?: number;
    delay?: number;
    queue?: boolean;
    maxConcurrent?: number;
    onLoad?: () => void;
  }
) => {
  const delay = options?.delay ?? (options?.priority ? options.priority * 1000 : 0);
  setTimeout(() => {
    retryDynamicImport(importFunction);
    options?.onLoad?.();
  }, delay);
};

// --- Batching/Concurrency Control ---
const loadQueue: Array<() => void> = [];
let currentLoads = 0;
function enqueueLoad(fn: () => void, maxConcurrent: number) {
  if (currentLoads < maxConcurrent) {
    currentLoads++;
    fn();
  } else {
    loadQueue.push(fn);
  }
}
function dequeueLoad() {
  currentLoads = Math.max(0, currentLoads - 1);
  if (loadQueue.length > 0) {
    const next = loadQueue.shift();
    if (next) {
      currentLoads++;
      next();
    }
  }
}
