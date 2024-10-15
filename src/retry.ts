import { ComponentType, lazy } from 'react';
import { defaultConfig, RetryConfig } from './config';
import { getRouteComponentUrl, getRetryImportFunction } from './utils';
import { cacheComponent, getCachedComponent } from './cache';
import { handleFailureWithCircuitBreaker } from './circuitBreaker';

export function retryDynamicImport<T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  config: RetryConfig = defaultConfig
): React.LazyExoticComponent<T> {
  let retryCount = 0;
  let hasTimedOut = false;
  const { maxRetryCount, timeoutMs } = config;

  const loadComponent = (): Promise<{ default: T }> =>
    new Promise<{ default: T }>((resolve, reject: (reason?: any) => void) => {
      const importUrl = getRouteComponentUrl(importFunction);
      const cachedComponent = importUrl ? getCachedComponent(importUrl) : null;

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
              cacheComponent(importUrl, module);
            }
            resolve(module);
          })
          .catch((error) => {
            retryCount += 1;
            if (handleFailureWithCircuitBreaker(retryCount, config)) {
              reject(error);
              return;
            }
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

export const prefetchDynamicImport = (importFunction: () => Promise<any>) => {
  const retryImport = getRetryImportFunction(importFunction, 0);
  
  retryImport()
    .then(() => console.log('Component prefetched successfully.'))
    .catch((error) => console.warn('Prefetching component failed:', error));
};

export const priorityLoadComponent = (importFunction: () => Promise<any>, priority: number) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1000);
};