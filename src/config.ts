// Yo, so here's our `defaultConfig`. It's like the fallback settings when nobody tells us what to do.
// Think of it like the default plan: how many times we'll retry something, how long we'll wait before calling it quits, etc.
export const defaultConfig = {
  circuitBreakerThreshold: 5, // This is like, “Yo, after 5 fails, stop trying. Take a break.”
  resetTimeMs: 30000, // We’ll chill for 30 seconds before we give it another go.
  maxRetryCount: 15, // If we fail, we’ll try again up to 15 times before throwing in the towel.
  initialRetryDelayMs: 500, // On the first fail, we’ll wait half a second before trying again.
  maxRetryDelayMs: 5000, // But if we keep failing, the wait time can go up to 5 seconds between retries.
  timeoutMs: 30000, // And if a task takes more than 30 seconds, we say, "Forget it!"
};

// This is just a type that says "Yo, `RetryConfig` is whatever's inside `defaultConfig`."
export type RetryConfig = typeof defaultConfig;

/**
 * Now this function here is the real MVP. It takes some custom settings if you got any,
 * but if you don’t? No problem, we just roll with the defaultConfig.
 * Basically, it’s like: "Here’s your config, but if you tell me something different,
 * I’ll merge that in with what we already got."
 * 
 * @param {Partial<RetryConfig>} overrides - Your custom settings, if you’ve got ‘em.
 * @returns {RetryConfig} - The full config we’ll use, with your tweaks if you gave us any.
 */
export function getConfig(overrides?: Partial<RetryConfig>): RetryConfig {
  return { ...defaultConfig, ...overrides }; // Take the default, mix in any custom stuff you gave us, and boom, there's your config.
}
