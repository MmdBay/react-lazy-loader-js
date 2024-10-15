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

declare function retryDynamicImport<T extends ComponentType<any>>(importFunction: () => Promise<{
    default: T;
}>, config?: RetryConfig): React.LazyExoticComponent<T>;
declare const prefetchDynamicImport: (importFunction: () => Promise<any>) => void;
declare const priorityLoadComponent: (importFunction: () => Promise<any>, priority: number) => void;

export { prefetchDynamicImport, priorityLoadComponent, retryDynamicImport };
