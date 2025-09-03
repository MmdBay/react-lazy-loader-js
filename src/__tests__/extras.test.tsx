import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  useLoaderTelemetry,
  registerLoaderTheme,
  getRegisteredLoaderTheme,
  registerLoaderAnimation,
  getRegisteredLoaderAnimation,
  createCustomCache,
  LazyLoaderErrorBoundary,
  LoaderThemeDefinition,
  LoaderAnimationComponent,
  CustomCache
} from '../extras';

// Mock React to avoid issues with class components in tests
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
    Component: actualReact.Component
  };
});

describe('Extras', () => {
  describe('useLoaderTelemetry', () => {
    function TestComponent() {
      const { logEvent, getMetrics } = useLoaderTelemetry();
      
      return (
        <div>
          <button onClick={() => logEvent('test-event', { data: 'test' })}>
            Log Event
          </button>
          <button onClick={() => {
            const metrics = getMetrics();
            // Set data attribute for testing
            document.body.setAttribute('data-metrics-count', metrics.length.toString());
          }}>
            Get Metrics
          </button>
        </div>
      );
    }

    test('should provide logEvent and getMetrics functions', () => {
      render(<TestComponent />);
      
      expect(screen.getByText('Log Event')).toBeInTheDocument();
      expect(screen.getByText('Get Metrics')).toBeInTheDocument();
    });

    test('should log events with timestamp', () => {
      render(<TestComponent />);
      
      const logButton = screen.getByText('Log Event');
      const getButton = screen.getByText('Get Metrics');
      
      // Log an event
      fireEvent.click(logButton);
      
      // Get metrics
      fireEvent.click(getButton);
      
      expect(document.body.getAttribute('data-metrics-count')).toBe('1');
    });

    test('should accumulate multiple events', () => {
      render(<TestComponent />);
      
      const logButton = screen.getByText('Log Event');
      const getButton = screen.getByText('Get Metrics');
      
      // Log multiple events
      fireEvent.click(logButton);
      fireEvent.click(logButton);
      fireEvent.click(logButton);
      
      // Get metrics
      fireEvent.click(getButton);
      
      expect(document.body.getAttribute('data-metrics-count')).toBe('3');
    });

    test('should return shallow copy of events from getMetrics', () => {
      function TestComponentWithMutation() {
        const { logEvent, getMetrics } = useLoaderTelemetry();
        
        return (
          <button onClick={() => {
            logEvent('original-event');
            const metrics = getMetrics();
            // Try to mutate the returned array
            metrics.push({ event: 'malicious-event', timestamp: Date.now() });
            
            // Get metrics again to verify original wasn't mutated
            const secondMetrics = getMetrics();
            document.body.setAttribute('data-immutable', 
              secondMetrics.length === 1 ? 'true' : 'false'
            );
          }}>
            Test Immutability
          </button>
        );
      }
      
      render(<TestComponentWithMutation />);
      fireEvent.click(screen.getByText('Test Immutability'));
      
      expect(document.body.getAttribute('data-immutable')).toBe('true');
    });

    test('should handle events with different data types', () => {
      function TestComponentWithVariousData() {
        const { logEvent, getMetrics } = useLoaderTelemetry();
        
        return (
          <button onClick={() => {
            logEvent('string-event', 'string data');
            logEvent('number-event', 42);
            logEvent('object-event', { complex: { nested: 'data' } });
            logEvent('array-event', [1, 2, 3]);
            logEvent('null-event', null);
            logEvent('undefined-event', undefined);
            logEvent('no-data-event');
            
            const metrics = getMetrics();
            document.body.setAttribute('data-variety-count', metrics.length.toString());
          }}>
            Log Various
          </button>
        );
      }
      
      render(<TestComponentWithVariousData />);
      fireEvent.click(screen.getByText('Log Various'));
      
      expect(document.body.getAttribute('data-variety-count')).toBe('7');
    });
  });

  describe('Theme Registry', () => {
    beforeEach(() => {
      // Clear registry before each test
      // We need to access the internal registry, but since it's not exported,
      // we'll test through the public API
    });

    test('should register and retrieve themes', () => {
      const theme: LoaderThemeDefinition = {
        name: 'test-theme',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00'
        },
        styles: {
          borderRadius: '4px'
        }
      };

      registerLoaderTheme(theme);
      const retrieved = getRegisteredLoaderTheme('test-theme');
      
      expect(retrieved).toEqual(theme);
    });

    test('should overwrite existing themes with same name', () => {
      const theme1: LoaderThemeDefinition = {
        name: 'same-name',
        colors: { primary: '#ff0000' }
      };
      
      const theme2: LoaderThemeDefinition = {
        name: 'same-name',
        colors: { primary: '#0000ff' }
      };

      registerLoaderTheme(theme1);
      registerLoaderTheme(theme2);
      
      const retrieved = getRegisteredLoaderTheme('same-name');
      expect(retrieved?.colors?.primary).toBe('#0000ff');
    });

    test('should return undefined for non-existent themes', () => {
      const retrieved = getRegisteredLoaderTheme('non-existent');
      expect(retrieved).toBeUndefined();
    });

    test('should throw error for theme without name', () => {
      const themeWithoutName = {
        colors: { primary: '#ff0000' }
      } as any; // Use any to bypass TypeScript checking for this test

      expect(() => registerLoaderTheme(themeWithoutName)).toThrow(
        'registerLoaderTheme: theme must have a unique "name" field'
      );
    });

    test('should throw error for null/undefined theme', () => {
      expect(() => registerLoaderTheme(null as any)).toThrow();
      expect(() => registerLoaderTheme(undefined as any)).toThrow();
    });

    test('should handle themes with additional custom properties', () => {
      const extendedTheme: LoaderThemeDefinition = {
        name: 'extended-theme',
        colors: { primary: '#ff0000' },
        customProperty: 'custom value',
        nestedCustom: {
          deeply: {
            nested: 'value'
          }
        }
      };

      registerLoaderTheme(extendedTheme);
      const retrieved = getRegisteredLoaderTheme('extended-theme');
      
      expect(retrieved).toEqual(extendedTheme);
      expect((retrieved as any).customProperty).toBe('custom value');
    });
  });

  describe('Animation Registry', () => {
    const MockAnimation: LoaderAnimationComponent = (props) => (
      <div data-testid="mock-animation" {...props}>Mock Animation</div>
    );

    test('should register and retrieve animations', () => {
      registerLoaderAnimation('test-animation', MockAnimation);
      const retrieved = getRegisteredLoaderAnimation('test-animation');
      
      expect(retrieved).toBe(MockAnimation);
    });

    test('should overwrite existing animations with same key', () => {
      const Animation1: LoaderAnimationComponent = () => <div>Animation 1</div>;
      const Animation2: LoaderAnimationComponent = () => <div>Animation 2</div>;

      registerLoaderAnimation('same-key', Animation1);
      registerLoaderAnimation('same-key', Animation2);
      
      const retrieved = getRegisteredLoaderAnimation('same-key');
      expect(retrieved).toBe(Animation2);
    });

    test('should return undefined for non-existent animations', () => {
      const retrieved = getRegisteredLoaderAnimation('non-existent');
      expect(retrieved).toBeUndefined();
    });

    test('should throw error for empty key', () => {
      expect(() => registerLoaderAnimation('', MockAnimation)).toThrow(
        'registerLoaderAnimation: key is required'
      );
    });

    test('should throw error for null/undefined key', () => {
      expect(() => registerLoaderAnimation(null as any, MockAnimation)).toThrow();
      expect(() => registerLoaderAnimation(undefined as any, MockAnimation)).toThrow();
    });

    test('should handle function components', () => {
      const FunctionComponent: LoaderAnimationComponent = ({ color, size }) => (
        <div style={{ color, width: size, height: size }}>
          Function Component
        </div>
      );

      registerLoaderAnimation('function-component', FunctionComponent);
      const retrieved = getRegisteredLoaderAnimation('function-component');
      
      expect(retrieved).toBe(FunctionComponent);
    });

    test('should handle arrow function components', () => {
      const ArrowComponent: LoaderAnimationComponent = (props) => (
        <span {...props}>Arrow Component</span>
      );

      registerLoaderAnimation('arrow-component', ArrowComponent);
      const retrieved = getRegisteredLoaderAnimation('arrow-component');
      
      expect(retrieved).toBe(ArrowComponent);
    });
  });

  describe('Custom Cache', () => {
    test('should return the same cache implementation passed to it', () => {
      const mockCache: CustomCache = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
      };

      const result = createCustomCache(mockCache);
      expect(result).toBe(mockCache);
    });

    test('should work with different cache implementations', () => {
      // Create a proper implementation without private properties
      const storage = new Map();
      const mapCache: CustomCache = {
        get(key) { return storage.get(key); },
        set(key, value) { storage.set(key, value); },
        delete(key) { storage.delete(key); },
        clear() { storage.clear(); }
      };

      const customCache = createCustomCache(mapCache);
      
      customCache.set('test-key', 'test-value');
      expect(customCache.get('test-key')).toBe('test-value');
      
      customCache.delete('test-key');
      expect(customCache.get('test-key')).toBeUndefined();
    });

    test('should preserve cache method bindings', () => {
      // Create cache with context that can be properly typed
      let prefix = 'test:';
      const contextualCache: CustomCache = {
        get(key) { return `${prefix}${key}`; },
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn()
      };

      const customCache = createCustomCache(contextualCache);
      
      // Test that the function works correctly
      expect(customCache.get('key')).toBe('test:key');
    });
  });

  describe('LazyLoaderErrorBoundary', () => {
    // Component that throws an error
    function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div data-testid="success">No error</div>;
    }

    test('should render children when no error occurs', () => {
      const fallback = jest.fn();
      
      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <ThrowingComponent shouldThrow={false} />
        </LazyLoaderErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
      expect(fallback).not.toHaveBeenCalled();
    });

    test('should render fallback when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const fallback = jest.fn((error, retry) => (
        <div data-testid="error-fallback">
          Error: {error.message}
          <button onClick={retry}>Retry</button>
        </div>
      ));

      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <ThrowingComponent shouldThrow={true} />
        </LazyLoaderErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Error: Test error')).toBeInTheDocument();
      expect(fallback).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        expect.any(Function)
      );

      consoleSpy.mockRestore();
    });

    test('should provide retry functionality', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let shouldThrow = true;

      function ConditionalThrowingComponent() {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div data-testid="success-after-retry">Success after retry</div>;
      }

      const fallback = (error: Error, retry: () => void) => (
        <div data-testid="error-fallback">
          <button 
            onClick={() => {
              shouldThrow = false; // Fix the error condition
              retry();
            }}
            data-testid="retry-button"
          >
            Retry
          </button>
        </div>
      );

      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <ConditionalThrowingComponent />
        </LazyLoaderErrorBoundary>
      );

      // Initially should show error
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Click retry
      fireEvent.click(screen.getByTestId('retry-button'));

      // Should now show success
      expect(screen.getByTestId('success-after-retry')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('should log errors to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const fallback = () => <div>Error occurred</div>;

      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <ThrowingComponent shouldThrow={true} />
        </LazyLoaderErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'LazyLoaderErrorBoundary caught error:',
        expect.objectContaining({ message: 'Test error' }),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    test('should handle multiple errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      let errorCount = 0;

      function MultipleErrorComponent(): JSX.Element {
        errorCount++;
        throw new Error(`Error ${errorCount}`);
      }

      const fallback = (error: Error, retry: () => void) => (
        <div data-testid="error-fallback">
          {error.message}
          <button onClick={retry} data-testid="retry-button">Retry</button>
        </div>
      );

      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <MultipleErrorComponent />
        </LazyLoaderErrorBoundary>
      );

      // First error (current errorCount value)
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Retry (will cause second error)
      fireEvent.click(screen.getByTestId('retry-button'));
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Retry again (will cause third error)
      fireEvent.click(screen.getByTestId('retry-button'));
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('should handle async-like errors via immediate throw', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      function ThrowInRender(): JSX.Element {
        throw new Error('Sync error');
      }

      const fallback = (error: Error) => (
        <div data-testid="async-error">Async Error: {error.message}</div>
      );

      render(
        <LazyLoaderErrorBoundary fallback={fallback}>
          <ThrowInRender />
        </LazyLoaderErrorBoundary>
      );

      expect(screen.getByTestId('async-error')).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    test('should handle complex fallback components', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const ComplexFallback = (error: Error, retry: () => void) => (
        <div data-testid="complex-fallback">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{error.message}</pre>
            <pre>{error.stack}</pre>
          </details>
          <div>
            <button onClick={retry}>Try again</button>
            <button onClick={() => window.location.reload()}>Reload page</button>
          </div>
        </div>
      );

      render(
        <LazyLoaderErrorBoundary fallback={ComplexFallback}>
          <ThrowingComponent shouldThrow={true} />
        </LazyLoaderErrorBoundary>
      );

      expect(screen.getByTestId('complex-fallback')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Error details')).toBeInTheDocument();
      expect(screen.getByText('Try again')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Integration Tests', () => {
    test('should work together with telemetry, themes, and animations', () => {
      // Register theme and animation
      const theme: LoaderThemeDefinition = {
        name: 'integration-theme',
        colors: { primary: '#123456' }
      };
      
      const Animation: LoaderAnimationComponent = () => (
        <div data-testid="integration-animation">Integration Animation</div>
      );

      registerLoaderTheme(theme);
      registerLoaderAnimation('integration-anim', Animation);

      function IntegrationComponent() {
        const { logEvent, getMetrics } = useLoaderTelemetry();
        
        return (
          <div>
            <button onClick={() => {
              logEvent('theme-accessed', { theme: getRegisteredLoaderTheme('integration-theme') });
              logEvent('animation-accessed', { animation: 'integration-anim' });
            }}>
              Access Theme and Animation
            </button>
            <button onClick={() => {
              const metrics = getMetrics();
              document.body.setAttribute('data-integration-events', metrics.length.toString());
            }}>
              Check Events
            </button>
          </div>
        );
      }

      render(<IntegrationComponent />);

      fireEvent.click(screen.getByText('Access Theme and Animation'));
      fireEvent.click(screen.getByText('Check Events'));

      expect(document.body.getAttribute('data-integration-events')).toBe('2');
      expect(getRegisteredLoaderTheme('integration-theme')).toEqual(theme);
      expect(getRegisteredLoaderAnimation('integration-anim')).toBe(Animation);
    });
  });
});
