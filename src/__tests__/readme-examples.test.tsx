import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { retryDynamicImport, LazyLoader } from '../retry';
import Loader from '../LoadingSpinner';

// Mock console.log to avoid test output clutter
jest.spyOn(console, 'log').mockImplementation();

// Mock the networkSpeed module
jest.mock('../networkSpeed', () => ({
  getNetworkInfo: jest.fn().mockReturnValue(Promise.resolve({
    effectiveType: '4g',
    downlink: 10,
    saveData: false,
    isEstimate: false,
  })),
  getNetworkInfoSync: jest.fn().mockReturnValue({
    effectiveType: '4g',
    downlink: 10,
    saveData: false,
    isEstimate: false,
  }),
}));

describe('README Examples Validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mark test environment to disable network info
    if (typeof window !== 'undefined') {
      (window as any).__JEST__ = true;
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Basic Examples', () => {
    test('Quick Start - Basic Retry Loader', () => {
      const LazyComponent = retryDynamicImport(() => 
        Promise.resolve({ default: () => <div>My Component</div> })
      );
      
      // Test that component is created without errors
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('function');
    });

    test('Suspense-less Loading', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>My Component</div> })}
            options={{ suspense: false }}
          />
        );
      }).not.toThrow();
    });

    test('Next.js App Router Example', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Login Component</div> })}
            options={{
              suspense: false,
              retry: { maxRetryCount: 3, strategy: 'exponential', initialRetryDelayMs: 800 },
              loader: { theme: 'dark', animationType: 'pulse', message: 'Loading...', size: 48, disableNetworkInfo: true },
              cache: { enabled: true, type: 'lfu', maxAge: 60 * 60 * 1000 },
            }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Advanced Examples', () => {
    test('Circuit Breaker Example', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Reports</div> })}
            options={{
              suspense: false,
              circuitBreaker: { enabled: true, threshold: 3, resetTime: 30000 },
              retry: { maxRetryCount: 3 },
              loader: { disableNetworkInfo: true },
            }}
          />
        );
      }).not.toThrow();
    });

    test('Full Configuration Example', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>My Component</div> })}
            options={{
              suspense: false,
              retry: {
                maxRetryCount: 3,
                strategy: 'linear',
                initialRetryDelayMs: 500,
              },
              loader: {
                theme: 'dark',
                animationType: 'spin',
                size: 48,
                message: 'Loading user profile...',
                disableNetworkInfo: true,
                errorFallback: (error, retry) => (
                  <div>
                    <p>Failed to load: {error.message}</p>
                    <button onClick={retry}>Retry</button>
                  </div>
                ),
              },
              cache: {
                enabled: true,
                type: 'lfu',
                maxSize: 50,
              },
            }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Loader Component Examples', () => {
    test('Basic Loader Usage', () => {
      expect(() => {
        render(
          <Loader
            size={100}
            color="#6366f1"
            animationType="gradient-spin"
            message="Loading your amazing content..."
            showNetworkInfo={true}
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });

    test('Professional Glassmorphism Theme', () => {
      expect(() => {
        render(
          <Loader
            size={120}
            animationType="particles"
            customTheme="glass"
            glassmorphism={true}
            vibrantColors={true}
            gradient={["#ff0099", "#00ff99", "#9900ff", "#ff9900", "#0099ff"]}
            message="Loading with style..."
            glow={true}
            glowIntensity={0.8}
            microInteractions={true}
            floatingStyle={true}
            particleCount={8}
            showNetworkInfo={true}
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });

    test('Modern Gradient Theme', () => {
      expect(() => {
        render(
          <Loader
            size={80}
            animationType="orbit"
            customTheme="gradient"
            colorShift={true}
            breathingEffect={true}
            magneticEffect={true}
            scaleEffect={true}
            smoothTransitions={true}
            message="Almost there..."
            showPercentage={true}
            progress={75}
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });

    test('Neon Cyberpunk Style', () => {
      expect(() => {
        render(
          <Loader
            size={90}
            animationType="neon"
            customTheme="neon"
            glow={true}
            glowIntensity={1.0}
            hoverEffects={true}
            pulseEffect={true}
            message="Entering the matrix..."
            darkMode={true}
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });

    test('Minimal Clean Design', () => {
      expect(() => {
        render(
          <Loader
            size={60}
            animationType="spiral"
            customTheme="minimal"
            reducedMotion={false}
            accessibility={true}
            message="Simple and elegant"
            showRetries={true}
            retries={2}
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });

    test('Neumorphism Effect', () => {
      expect(() => {
        render(
          <Loader
            size={100}
            animationType="elastic"
            neumorphism={true}
            customTheme="modern"
            rounded={true}
            autoHideDelay={5000}
            fadeInDuration={1000}
            message="Soft and modern design"
            disableNetworkInfo={true} // For tests
          />
        );
      }).not.toThrow();
    });
  });

  describe('Cache Examples', () => {
    test('LFU Cache Configuration', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Cached Component</div> })}
            options={{
              suspense: false,
              cache: { 
                enabled: true,
                type: 'lfu', 
                maxSize: 50 
              },
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });

    test('Cache with TTL', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>TTL Component</div> })}
            options={{
              suspense: false,
              cache: { 
                enabled: true,
                type: 'lfu', 
                maxSize: 20,
                maxAge: 86400000 // 24 hours
              },
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Error Handling Examples', () => {
    test('Custom Error Fallback', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.reject(new Error('Load failed'))}
            options={{
              suspense: false,
              retry: { maxRetryCount: 0 }, // Don't retry for this test
              loader: {
                disableNetworkInfo: true,
                errorFallback: (error, retry) => (
                  <div>
                    <h2>Something went wrong</h2>
                    <p>{error.message}</p>
                    <button onClick={retry}>Try Again</button>
                  </div>
                )
              }
            }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Retry Strategy Examples', () => {
    test('Exponential Backoff Strategy', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Component</div> })}
            options={{
              suspense: false,
              retry: {
                maxRetryCount: 3,
                strategy: 'exponential',
                initialRetryDelayMs: 1000,
                maxRetryDelayMs: 10000,
                backoffMultiplier: 2,
                jitter: true,
              },
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });

    test('Linear Strategy', () => {
      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Component</div> })}
            options={{
              suspense: false,
              retry: {
                maxRetryCount: 5,
                strategy: 'linear',
                initialRetryDelayMs: 500,
              },
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Complete Configuration Test', () => {
    test('Should handle complete options from README', () => {
      const completeOptions = {
        suspense: false,
        
        // Retry configuration
        retry: {
          maxRetryCount: 3,
          strategy: 'exponential' as const,
          initialRetryDelayMs: 1000,
          maxRetryDelayMs: 10000,
          backoffMultiplier: 2,
          jitter: true,
          onRetry: (attempt: number, error: any) => {},
          shouldRetry: (error: any) => true,
        },

        // Loader configuration
        loader: {
          theme: 'light',
          animationType: 'spin' as const,
          size: 48,
          message: 'Loading...',
          customStyle: {},
          glow: true,
          pulseEffect: true,
          gradient: ['#6366f1', '#8b5cf6'],
          disableNetworkInfo: true, // For tests
        },

        // Cache configuration
        cache: {
          enabled: true,
          type: 'lfu' as const,
          maxSize: 100,
          maxAge: 3600000,
        },

        // Circuit breaker
        circuitBreaker: {
          enabled: false,
          threshold: 5,
          resetTime: 30000,
        },
      };

      expect(() => {
        render(
          <LazyLoader
            importFunction={() => Promise.resolve({ default: () => <div>Complete Config Component</div> })}
            options={completeOptions}
          />
        );
      }).not.toThrow();
    });
  });
});
