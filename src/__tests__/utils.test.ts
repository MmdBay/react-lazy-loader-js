import { getRouteComponentUrl, getRetryImportFunction } from '../utils';

// Mock console.error to avoid test output clutter
const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

// Mock LFUCache
jest.mock('../cache', () => ({
  LFUCache: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue(null),
    set: jest.fn()
  }))
}));

describe('Utils', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('getRouteComponentUrl', () => {
    test('should extract URL from simple import function', () => {
      // Create a mock function with correct toString
      const importFn = jest.fn();
      importFn.toString = () => "() => import('./Component')";
      
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('./Component');
    });

    test('should extract URL with double quotes', () => {
      const importFn = jest.fn();
      importFn.toString = () => '() => import("./Component")';
      
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('./Component');
    });

    test('should extract URL with path', () => {
      const importFn = jest.fn();
      importFn.toString = () => "() => import('./components/MyComponent')";
      
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('./components/MyComponent');
    });

    test('should extract absolute paths', () => {
      const importFn = jest.fn();
      importFn.toString = () => "() => import('/absolute/path/Component')";
      
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('/absolute/path/Component');
    });

    test('should handle special characters', () => {
      const importFn = jest.fn();
      importFn.toString = () => "() => import('./My-Component_123')";
      
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('./My-Component_123');
    });

    test('should return null for non-import functions', () => {
      const notImportFn = jest.fn();
      notImportFn.toString = () => "() => console.log('test')";
      
      const url = getRouteComponentUrl(notImportFn as any);
      expect(url).toBeNull();
    });

    test('should handle malformed functions', () => {
      const malformedFn = jest.fn();
      malformedFn.toString = () => "malformed function";
      
      const url = getRouteComponentUrl(malformedFn as any);
      expect(url).toBeNull();
    });

    test('should handle complex function formatting', () => {
      const complexFn = jest.fn();
      complexFn.toString = () => `() => {
        // Some comment
        return import('./Component');
      }`;
      
      const url = getRouteComponentUrl(complexFn as any);
      expect(url).toBe('./Component');
    });

    test('should handle errors gracefully', () => {
      const errorFn = {
        toString: () => { throw new Error('toString error'); }
      } as any;
      
      const url = getRouteComponentUrl(errorFn);
      expect(url).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error in getRouteComponentUrl:', expect.any(Error));
    });
  });

  describe('getRetryImportFunction', () => {
    const originalImport = jest.fn().mockResolvedValue({ default: () => null });

    beforeEach(() => {
      // Mock global window and URL
      (globalThis as any).window = {
        location: { href: 'http://localhost:3000' }
      };

      (globalThis as any).URL = jest.fn().mockImplementation((url: string, base: string) => ({
        toString: () => `${base}${url}?v=mocked`,
        searchParams: {
          append: jest.fn()
        }
      }));
    });

    afterEach(() => {
      delete (globalThis as any).window;
      delete (globalThis as any).URL;
    });

    test('should return original function for retry count 0', () => {
      const retryFn = getRetryImportFunction(originalImport, 0);
      expect(retryFn).toBe(originalImport);
    });

    test('should return original function when URL extraction fails', () => {
      const invalidImport = jest.fn();
      invalidImport.toString = () => "() => console.log('not import')";
      
      const retryFn = getRetryImportFunction(invalidImport as any, 1);
      expect(retryFn).toBe(invalidImport);
    });

    test('should create new function for browser environment', () => {
      // Mock getRouteComponentUrl to return a valid URL
      const mockImport = jest.fn();
      mockImport.toString = () => "() => import('./Component')";
      
      const retryFn = getRetryImportFunction(mockImport as any, 1);
      expect(retryFn).not.toBe(mockImport);
      expect(typeof retryFn).toBe('function');
    });

    test('should handle server-side environment', () => {
      // Remove window to simulate server-side
      delete (globalThis as any).window;
      
      const retryFn = getRetryImportFunction(originalImport, 1);
      // In server environment, returns same function when URL extraction fails
      expect(retryFn).toBe(originalImport);
      expect(typeof retryFn).toBe('function');
    });

    test('should handle Next.js environment', () => {
      (globalThis as any).window = {
        location: { href: 'http://localhost:3000' },
        __NEXT_DATA__: {}
      };
      
      const mockImport = jest.fn();
      mockImport.toString = () => "() => import('./Component')";
      
      const retryFn = getRetryImportFunction(mockImport as any, 2);
      expect(retryFn).not.toBe(mockImport);
    });

    test('should handle URL construction errors', () => {
      (globalThis as any).URL = jest.fn().mockImplementation(() => {
        throw new Error('URL error');
      });
      
      const mockImport = jest.fn();
      mockImport.toString = () => "() => import('./Component')";
      
      const retryFn = getRetryImportFunction(mockImport as any, 1);
      expect(retryFn).toBe(mockImport);
      expect(consoleSpy).toHaveBeenCalledWith('Error in getRetryImportFunction:', expect.any(Error));
    });

    test('should use delay for server environment', async () => {
      delete (globalThis as any).window;
      
      jest.useFakeTimers();
      const mockImport = jest.fn().mockResolvedValue({ default: () => null });
      const retryFn = getRetryImportFunction(mockImport, 2);
      
      // Start the async call
      const promise = retryFn();
      
      // Advance timers to simulate delay
      jest.advanceTimersByTime(25); // 2 * 10 + buffer
      
      await promise;
      
      expect(mockImport).toHaveBeenCalled();
      jest.useRealTimers();
    });

          test('should propagate errors in delay-based retry', async () => {
        delete (globalThis as any).window;
        
        jest.useFakeTimers();
        const mockImport = jest.fn().mockRejectedValue(new Error('Import failed'));
              const retryFn = getRetryImportFunction(mockImport, 1);
        
        const promise = retryFn();
        jest.advanceTimersByTime(15); // 1 * 10 + buffer
        
        await expect(promise).rejects.toThrow('Import failed');
        expect(mockImport).toHaveBeenCalled();
        jest.useRealTimers();
      });

    test('should append cache busting parameters', () => {
      const mockUrl = {
        toString: () => 'mocked-url',
        searchParams: {
          append: jest.fn()
        }
      };
      
      (globalThis as any).URL = jest.fn().mockReturnValue(mockUrl);
      
      const mockImport = jest.fn();
      mockImport.toString = () => "() => import('./Component')";
      
      getRetryImportFunction(mockImport as any, 1);
      
      expect(mockUrl.searchParams.append).toHaveBeenCalledWith(
        'v',
        expect.stringMatching(/^\d+-[a-z0-9]+$/)
      );
    });

    test('should generate unique cache busting parameters', () => {
      const calls: string[] = [];
      const mockUrl = {
        toString: () => 'mocked-url',
        searchParams: {
          append: jest.fn((key: string, value: string) => {
            calls.push(value);
          })
        }
      };
      
      (globalThis as any).URL = jest.fn().mockReturnValue(mockUrl);
      
      const mockImport = jest.fn();
      mockImport.toString = () => "() => import('./Component')";
      
      getRetryImportFunction(mockImport as any, 1);
      getRetryImportFunction(mockImport as any, 1);
      getRetryImportFunction(mockImport as any, 2);
      
      expect(calls.length).toBe(3);
      expect(new Set(calls).size).toBe(3); // All should be unique
    });
  });

  describe('Integration Tests', () => {
    test('should work together for complete retry flow', () => {
      const importFn = jest.fn();
      importFn.toString = () => "() => import('./TestComponent')";
      
      // Extract URL
      const url = getRouteComponentUrl(importFn as any);
      expect(url).toBe('./TestComponent');
      
      // Create retry function
      const retryFn = getRetryImportFunction(importFn as any, 1);
      expect(retryFn).not.toBe(importFn);
      expect(typeof retryFn).toBe('function');
    });

    test('should handle edge cases in complete flow', () => {
      const invalidImport = jest.fn();
      invalidImport.toString = () => "() => 'not an import'";
      
      // Should handle invalid import gracefully
      const url = getRouteComponentUrl(invalidImport as any);
      expect(url).toBeNull();
      
      const retryFn = getRetryImportFunction(invalidImport as any, 1);
      expect(retryFn).toBe(invalidImport);
    });
  });

  describe('Performance Tests', () => {
    test('should handle many operations efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const importFn = jest.fn();
        importFn.toString = () => `() => import('./Component${i}')`;
        
        getRouteComponentUrl(importFn as any);
        getRetryImportFunction(importFn as any, 1);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });
});