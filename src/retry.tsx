import { getNetworkInfo } from './networkSpeed';
import React, { ComponentType, lazy, useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { getConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { LFUCache } from './cache';
import { CircuitBreaker } from './circuitBreaker';
import Loader from './LoadingSpinner';

const lfuCache = new LFUCache<string, any>(5, 3600000);

interface LoaderConfig {
  size?: number;
  borderSize?: number;
  color?: string;
  speed?: number;
  showRetries?: boolean;
  showNetworkInfo?: boolean;
  customStyle?: React.CSSProperties;
  errorFallback?: React.ReactNode; // نمایش fallback در صورت خطا
}

interface UseRetryDynamicImportResult {
  Component: React.LazyExoticComponent<ComponentType<any>>;
  retryCount: number;
  error: Error | null;
  reset: () => void;
}

function useRetryDynamicImport(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  customConfig?: Partial<RetryConfig>
): UseRetryDynamicImportResult {
  const config = getConfig(customConfig);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const circuitBreaker = useRef(new CircuitBreaker(config));

  const loadComponent = useCallback((): Promise<{ default: ComponentType<any> }> => {
    let hasTimedOut = false;
    const { maxRetryCount, timeoutMs } = config;
    const { effectiveType, downlink } = getNetworkInfo();
    const adjustedRetryCount = downlink < 1 || effectiveType.includes('2g') ? maxRetryCount * 2 : maxRetryCount;
    const adjustedDelay = downlink < 1 || effectiveType.includes('2g') ? config.initialRetryDelayMs * 2 : config.initialRetryDelayMs;
    const importUrl = getRouteComponentUrl(importFunction);
    const cachedComponent = importUrl ? lfuCache.get(importUrl) : null;
    if (cachedComponent) return Promise.resolve(cachedComponent);

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    return new Promise<{ default: ComponentType<any> }>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        hasTimedOut = true;
        reject(new Error('Component load timed out.'));
      }, timeoutMs);

      function tryLoadComponent(currentRetry: number) {
        if (hasTimedOut || signal.aborted) {
          clearTimeout(timeoutId);
          reject(new Error('Component load aborted.'));
          return;
        }
        const retryImport = getRetryImportFunction(importFunction, currentRetry);
        retryImport()
          .then((module) => {
            clearTimeout(timeoutId);
            if (importUrl) lfuCache.set(importUrl, module);
            resolve(module);
          })
          .catch((err) => {
            if (circuitBreaker.current.handleFailure()) {
              clearTimeout(timeoutId);
              reject(err);
              return;
            }
            if (currentRetry < adjustedRetryCount) {
              setTimeout(() => tryLoadComponent(currentRetry + 1), (currentRetry + 1) * adjustedDelay);
            } else {
              clearTimeout(timeoutId);
              reject(err);
            }
          });
      }
      tryLoadComponent(0);
    });
  }, [importFunction, config]);

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

/**
 * حرفه‌ای‌ترین LazyLoader با مدیریت خطا و قابلیت retry دستی
 */
export const LazyLoader = ({
  importFunction,
  customConfig,
  loaderConfig = {},
  fallback,
  ...rest
}: {
  importFunction: () => Promise<{ default: ComponentType<any> }>;
  customConfig?: Partial<RetryConfig>;
  loaderConfig?: Partial<LoaderConfig>;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  const { Component, retryCount, error, reset } = useRetryDynamicImport(importFunction, customConfig);
  const loaderProps = {
    retries: retryCount,
    size: loaderConfig.size,
    borderSize: loaderConfig.borderSize,
    color: loaderConfig.color,
    speed: loaderConfig.speed,
    showRetries: loaderConfig.showRetries,
    showNetworkInfo: loaderConfig.showNetworkInfo,
    customStyle: loaderConfig.customStyle,
  };

  if (error) {
    return loaderConfig.errorFallback ? (
      <>{loaderConfig.errorFallback}</>
    ) : (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ color: 'red', marginBottom: 8 }}>خطا در بارگذاری کامپوننت: {error.message}</div>
        <button onClick={reset} style={{ padding: '8px 16px', borderRadius: 4, cursor: 'pointer' }}>تلاش مجدد</button>
      </div>
    );
  }

  return (
    <Suspense fallback={fallback || <Loader {...loaderProps} />}>
      <Component {...rest} />
    </Suspense>
  );
};

// نسخه بهبود یافته retryDynamicImport برای استفاده مستقیم (سازگار با نسخه قبلی)
export function retryDynamicImport(
  importFunction: () => Promise<{ default: ComponentType<any> }>,
  customConfig?: Partial<RetryConfig>,
  loaderConfig?: Partial<LoaderConfig>
): React.FC<any> {
  return (props: any) => (
    <LazyLoader
      importFunction={importFunction}
      customConfig={customConfig}
      loaderConfig={loaderConfig}
      {...props}
    />
  );
}

// prefetch و priorityLoad بدون تغییر
export const prefetchDynamicImport = (importFunction: () => Promise<any>) => {
  const retryImport = getRetryImportFunction(importFunction, 0);
  retryImport()
    .then((module) => console.log('Component prefetched successfully.'))
    .catch((error) => console.warn('Prefetching component failed:', error));
};

export const priorityLoadComponent = (importFunction: () => Promise<any>, priority: number) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1000);
};
