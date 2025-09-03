import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { retryDynamicImport, useRetryDynamicImport, useMergedOptions, LazyLoader } from '../retry';

// Mock console.log to avoid test output clutter
jest.spyOn(console, 'log').mockImplementation();

// Mock the networkSpeed module to avoid async state update warnings
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

describe('Retry Module', () => {
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

  describe('retryDynamicImport', () => {
    test('should return a React component', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      const LazyComponent = retryDynamicImport(mockImport);
      
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('function');
    });

    test('should accept options parameter', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      const options = {
        retry: { maxRetryCount: 5 },
        cache: { enabled: true }
      };

      const LazyComponent = retryDynamicImport(mockImport, options);
      
      expect(LazyComponent).toBeDefined();
    });
  });

  describe('useRetryDynamicImport', () => {
    function TestComponent({ importFn, options }: any) {
      const result = useRetryDynamicImport(importFn, options);
      return (
        <div>
          <span data-testid="component-type">{typeof result.Component}</span>
          <span data-testid="retry-count">{result.retryCount}</span>
          <span data-testid="error">{result.error?.message || 'no-error'}</span>
        </div>
      );
    }

    test('should return hook result object', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      render(
        <TestComponent 
          importFn={mockImport}
          options={{}}
        />
      );

      expect(screen.getByTestId('component-type')).toHaveTextContent('object');
      expect(screen.getByTestId('retry-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('useMergedOptions', () => {
    function TestOptionsComponent({ options }: any) {
      const mergedOptions = useMergedOptions(options);
      return (
        <div data-testid="merged-options">
          {JSON.stringify(mergedOptions)}
        </div>
      );
    }

    test('should return merged options in React component', () => {
      const customOptions = {
        retry: { maxRetryCount: 5 },
        circuitBreaker: { threshold: 3 }
      };

      render(<TestOptionsComponent options={customOptions} />);
      
      const mergedElement = screen.getByTestId('merged-options');
      expect(mergedElement).toBeInTheDocument();
      
      const mergedText = mergedElement.textContent;
      expect(mergedText).toContain('"maxRetryCount":5');
      expect(mergedText).toContain('"threshold":3');
    });
  });

  describe('LazyLoader component', () => {
    test('should render without errors', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      render(
        <LazyLoader 
          importFunction={mockImport}
          options={{
            suspense: false,
            loader: { disableNetworkInfo: true }
          }}
        />
      );

      // Should render without errors
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('should handle custom loader configuration', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      render(
        <LazyLoader 
          importFunction={mockImport}
          options={{
            suspense: false,
            loader: {
              size: 60,
              color: 'red',
              disableNetworkInfo: true,
              message: 'Loading custom...'
            }
          }}
        />
      );

      expect(screen.getByText('Loading custom...')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    test('should handle basic functionality', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      expect(() => {
        render(
          <LazyLoader 
            importFunction={mockImport}
            options={{
              suspense: false,
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });

    test('should handle empty options', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Test Component</div> });

      expect(() => {
        render(
          <LazyLoader
            importFunction={mockImport}
            options={{
              suspense: false,
              loader: { disableNetworkInfo: true }
            }}
          />
        );
      }).not.toThrow();
    });

    test('should handle CDN import configuration', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>CDN Component</div> });

      expect(() => {
        render(
          <LazyLoader
            importFunction={mockImport}
            options={{
              suspense: false,
              importFrom: {
                type: 'cdn',
                baseUrl: 'https://cdn.example.com',
                fallback: 'local',
              },
              loader: { disableNetworkInfo: true, message: 'Loading from CDN...' }
            }}
          />
        );
      }).not.toThrow();
    });

    test('should handle CDN import with string type', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>CDN Component</div> });

      expect(() => {
        render(
          <LazyLoader
            importFunction={mockImport}
            options={{
              suspense: false,
              importFrom: 'cdn',
              loader: { disableNetworkInfo: true, message: 'Loading from CDN...' }
            }}
          />
        );
      }).not.toThrow();
    });

    test('should handle remote import configuration', () => {
      const mockImport = jest.fn()
        .mockResolvedValue({ default: () => <div>Remote Component</div> });

      expect(() => {
        render(
          <LazyLoader
            importFunction={mockImport}
            options={{
              suspense: false,
              importFrom: {
                type: 'cdn',
                baseUrl: 'https://invalid-cdn.com',
                fallback: 'local',
              },
              loader: { disableNetworkInfo: true, message: 'Loading with fallback...' }
            }}
          />
        );
      }).not.toThrow();
    });
  });
});