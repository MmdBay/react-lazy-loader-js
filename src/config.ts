export const defaultConfig = {
  circuitBreakerThreshold: 5,
  resetTimeMs: 30000,
  maxRetryCount: 15,
  initialRetryDelayMs: 500,
  maxRetryDelayMs: 5000,
  timeoutMs: 30000,
};

export type RetryConfig = typeof defaultConfig;

/**
 * @param {Partial<RetryConfig>} overrides
 * @returns {RetryConfig}
 */
export function getConfig(overrides?: Partial<RetryConfig>): RetryConfig {
  return { ...defaultConfig, ...overrides };
}
