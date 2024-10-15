export const defaultConfig = {
    maxRetryCount: 15,
    initialRetryDelayMs: 500,
    maxRetryDelayMs: 5000,
    timeoutMs: 30000,
    circuitBreakerThreshold: 5,
    resetTimeMs: 30000,
  };
  
  export type RetryConfig = typeof defaultConfig;