// Default configuration for retry behavior and circuit breaker
export const defaultConfig = {
  circuitBreakerThreshold: 5, // After 5 failures, stop trying and take a break
  resetTimeMs: 30000, // Wait 30 seconds before trying again after circuit breaker opens
  maxRetryCount: 15, // Try up to 15 times before giving up
  initialRetryDelayMs: 500, // Wait 500ms before first retry
  maxRetryDelayMs: 5000, // Maximum wait time between retries is 5 seconds
  timeoutMs: 30000, // Timeout after 30 seconds
};

// Type definition for retry configuration
export type RetryConfig = typeof defaultConfig;

/**
 * Get the final configuration by merging default settings with custom overrides.
 * 
 * @param overrides - Custom settings to override defaults
 * @returns Complete configuration with defaults and overrides merged
 */
export function getConfig(overrides?: Partial<RetryConfig>): RetryConfig {
  return { ...defaultConfig, ...overrides };
}
