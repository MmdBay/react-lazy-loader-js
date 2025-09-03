import { defaultConfig, getConfig, RetryConfig } from '../config';

describe('Config', () => {
  describe('defaultConfig', () => {
    test('should have all required properties', () => {
      expect(defaultConfig).toHaveProperty('circuitBreakerThreshold');
      expect(defaultConfig).toHaveProperty('resetTimeMs');
      expect(defaultConfig).toHaveProperty('maxRetryCount');
      expect(defaultConfig).toHaveProperty('initialRetryDelayMs');
      expect(defaultConfig).toHaveProperty('maxRetryDelayMs');
      expect(defaultConfig).toHaveProperty('timeoutMs');
    });

    test('should have sensible default values', () => {
      expect(defaultConfig.circuitBreakerThreshold).toBe(5);
      expect(defaultConfig.resetTimeMs).toBe(30000); // 30 seconds
      expect(defaultConfig.maxRetryCount).toBe(15);
      expect(defaultConfig.initialRetryDelayMs).toBe(500);
      expect(defaultConfig.maxRetryDelayMs).toBe(5000);
      expect(defaultConfig.timeoutMs).toBe(30000); // 30 seconds
    });

    test('should have numeric values for all properties', () => {
      Object.values(defaultConfig).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('getConfig function', () => {
    test('should return default config when no overrides provided', () => {
      const config = getConfig();
      expect(config).toEqual(defaultConfig);
    });

    test('should return default config when empty overrides provided', () => {
      const config = getConfig({});
      expect(config).toEqual(defaultConfig);
    });

    test('should merge single override with defaults', () => {
      const config = getConfig({ maxRetryCount: 10 });
      
      expect(config.maxRetryCount).toBe(10);
      expect(config.circuitBreakerThreshold).toBe(defaultConfig.circuitBreakerThreshold);
      expect(config.resetTimeMs).toBe(defaultConfig.resetTimeMs);
      expect(config.initialRetryDelayMs).toBe(defaultConfig.initialRetryDelayMs);
      expect(config.maxRetryDelayMs).toBe(defaultConfig.maxRetryDelayMs);
      expect(config.timeoutMs).toBe(defaultConfig.timeoutMs);
    });

    test('should merge multiple overrides with defaults', () => {
      const overrides = {
        maxRetryCount: 5,
        initialRetryDelayMs: 1000,
        timeoutMs: 60000
      };
      
      const config = getConfig(overrides);
      
      expect(config.maxRetryCount).toBe(5);
      expect(config.initialRetryDelayMs).toBe(1000);
      expect(config.timeoutMs).toBe(60000);
      expect(config.circuitBreakerThreshold).toBe(defaultConfig.circuitBreakerThreshold);
      expect(config.resetTimeMs).toBe(defaultConfig.resetTimeMs);
      expect(config.maxRetryDelayMs).toBe(defaultConfig.maxRetryDelayMs);
    });

    test('should override all properties when provided', () => {
      const completeOverride: RetryConfig = {
        circuitBreakerThreshold: 3,
        resetTimeMs: 15000,
        maxRetryCount: 8,
        initialRetryDelayMs: 200,
        maxRetryDelayMs: 10000,
        timeoutMs: 45000
      };
      
      const config = getConfig(completeOverride);
      expect(config).toEqual(completeOverride);
    });

    test('should not mutate the default config', () => {
      const originalDefault = { ...defaultConfig };
      
      getConfig({ maxRetryCount: 999 });
      
      expect(defaultConfig).toEqual(originalDefault);
    });

    test('should not mutate the override object', () => {
      const overrides = { maxRetryCount: 10 };
      const originalOverrides = { ...overrides };
      
      getConfig(overrides);
      
      expect(overrides).toEqual(originalOverrides);
    });

    test('should handle zero values in overrides', () => {
      const config = getConfig({ 
        maxRetryCount: 0,
        initialRetryDelayMs: 0 
      });
      
      expect(config.maxRetryCount).toBe(0);
      expect(config.initialRetryDelayMs).toBe(0);
    });

    test('should handle negative values in overrides', () => {
      const config = getConfig({ 
        maxRetryCount: -1,
        resetTimeMs: -5000 
      });
      
      expect(config.maxRetryCount).toBe(-1);
      expect(config.resetTimeMs).toBe(-5000);
    });
  });

  describe('RetryConfig type', () => {
    test('should accept valid config objects', () => {
      const validConfig: RetryConfig = {
        circuitBreakerThreshold: 3,
        resetTimeMs: 20000,
        maxRetryCount: 5,
        initialRetryDelayMs: 100,
        maxRetryDelayMs: 2000,
        timeoutMs: 15000
      };
      
      const config = getConfig(validConfig);
      expect(config).toEqual(validConfig);
    });

    test('should work with partial config objects', () => {
      const partialConfig: Partial<RetryConfig> = {
        maxRetryCount: 7,
        timeoutMs: 25000
      };
      
      const config = getConfig(partialConfig);
      expect(config.maxRetryCount).toBe(7);
      expect(config.timeoutMs).toBe(25000);
      expect(config.circuitBreakerThreshold).toBe(defaultConfig.circuitBreakerThreshold);
    });
  });

  describe('Edge Cases and Scenarios', () => {
    test('should handle undefined override', () => {
      const config = getConfig(undefined);
      expect(config).toEqual(defaultConfig);
    });

    test('should work with real-world scenarios', () => {
      // Fast retry scenario
      const fastRetryConfig = getConfig({
        maxRetryCount: 3,
        initialRetryDelayMs: 100,
        maxRetryDelayMs: 1000,
        timeoutMs: 5000
      });
      
      expect(fastRetryConfig.maxRetryCount).toBe(3);
      expect(fastRetryConfig.initialRetryDelayMs).toBe(100);
      expect(fastRetryConfig.maxRetryDelayMs).toBe(1000);
      expect(fastRetryConfig.timeoutMs).toBe(5000);
      expect(fastRetryConfig.circuitBreakerThreshold).toBe(defaultConfig.circuitBreakerThreshold);
      
      // Conservative retry scenario
      const conservativeConfig = getConfig({
        maxRetryCount: 20,
        initialRetryDelayMs: 2000,
        maxRetryDelayMs: 30000,
        circuitBreakerThreshold: 10,
        resetTimeMs: 120000 // 2 minutes
      });
      
      expect(conservativeConfig.maxRetryCount).toBe(20);
      expect(conservativeConfig.initialRetryDelayMs).toBe(2000);
      expect(conservativeConfig.maxRetryDelayMs).toBe(30000);
      expect(conservativeConfig.circuitBreakerThreshold).toBe(10);
      expect(conservativeConfig.resetTimeMs).toBe(120000);
      
      // Testing scenario with instant retries
      const testingConfig = getConfig({
        maxRetryCount: 1,
        initialRetryDelayMs: 0,
        maxRetryDelayMs: 0,
        timeoutMs: 1000,
        circuitBreakerThreshold: 1,
        resetTimeMs: 100
      });
      
      expect(testingConfig.maxRetryCount).toBe(1);
      expect(testingConfig.initialRetryDelayMs).toBe(0);
      expect(testingConfig.maxRetryDelayMs).toBe(0);
      expect(testingConfig.timeoutMs).toBe(1000);
      expect(testingConfig.circuitBreakerThreshold).toBe(1);
      expect(testingConfig.resetTimeMs).toBe(100);
    });

    test('should maintain object structure integrity', () => {
      const config = getConfig({ maxRetryCount: 5 });
      
      // Should have exactly the same keys as defaultConfig
      expect(Object.keys(config).sort()).toEqual(Object.keys(defaultConfig).sort());
      
      // Should be a new object, not a reference to defaultConfig
      expect(config).not.toBe(defaultConfig);
    });

    test('should support repeated calls with different overrides', () => {
      const config1 = getConfig({ maxRetryCount: 3 });
      const config2 = getConfig({ initialRetryDelayMs: 1000 });
      const config3 = getConfig({ timeoutMs: 20000 });
      
      expect(config1.maxRetryCount).toBe(3);
      expect(config1.initialRetryDelayMs).toBe(defaultConfig.initialRetryDelayMs);
      
      expect(config2.maxRetryCount).toBe(defaultConfig.maxRetryCount);
      expect(config2.initialRetryDelayMs).toBe(1000);
      
      expect(config3.timeoutMs).toBe(20000);
      expect(config3.maxRetryCount).toBe(defaultConfig.maxRetryCount);
      expect(config3.initialRetryDelayMs).toBe(defaultConfig.initialRetryDelayMs);
    });
  });

  describe('Type Safety', () => {
    test('should ensure RetryConfig type matches defaultConfig structure', () => {
      // This test verifies that the RetryConfig type is correctly derived from defaultConfig
      const config: RetryConfig = defaultConfig;
      
      // Should not throw TypeScript errors
      expect(config.circuitBreakerThreshold).toBeDefined();
      expect(config.resetTimeMs).toBeDefined();
      expect(config.maxRetryCount).toBeDefined();
      expect(config.initialRetryDelayMs).toBeDefined();
      expect(config.maxRetryDelayMs).toBeDefined();
      expect(config.timeoutMs).toBeDefined();
    });
  });
});
