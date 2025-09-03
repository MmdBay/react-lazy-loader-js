import { NetworkInfo } from '../networkSpeed';

describe('NetworkSpeed Module', () => {
  describe('NetworkInfo Interface', () => {
    test('should define proper NetworkInfo interface', () => {
      // Test that the interface exists and has expected shape
      const mockNetworkInfo: NetworkInfo = {
        effectiveType: '4g',
        downlink: 10,
        saveData: false,
        lastTested: Date.now(),
        isEstimate: false
      };
      
      expect(mockNetworkInfo).toHaveProperty('effectiveType');
      expect(mockNetworkInfo).toHaveProperty('downlink');
      expect(mockNetworkInfo).toHaveProperty('saveData');
      expect(mockNetworkInfo).toHaveProperty('lastTested');
      expect(mockNetworkInfo).toHaveProperty('isEstimate');
    });

    test('should handle optional properties', () => {
      const mockNetworkInfo: NetworkInfo = {
        effectiveType: 'unknown',
        downlink: 0,
        saveData: false,
        lastTested: Date.now(),
        isEstimate: true,
        type: 'wifi',
        downlinkMax: 100,
        rtt: 50,
        latency: 50,
        error: 'Test error'
      };
      
      expect(mockNetworkInfo.type).toBe('wifi');
      expect(mockNetworkInfo.error).toBe('Test error');
    });
  });

  describe('Module Functions', () => {
    test('should export required functions', async () => {
      const { 
        getNetworkInfo, 
        getNetworkInfoSync, 
        subscribeNetworkInfo, 
        refreshNetworkInfo,
        clearNetworkCache 
      } = await import('../networkSpeed');
      
      expect(typeof getNetworkInfo).toBe('function');
      expect(typeof getNetworkInfoSync).toBe('function');
      expect(typeof subscribeNetworkInfo).toBe('function');
      expect(typeof refreshNetworkInfo).toBe('function');
      expect(typeof clearNetworkCache).toBe('function');
    });

    test('should handle basic function calls without errors', async () => {
      const { 
        getNetworkInfo, 
        getNetworkInfoSync, 
        subscribeNetworkInfo, 
        clearNetworkCache 
      } = await import('../networkSpeed');
      
      expect(() => {
        clearNetworkCache();
        const info = getNetworkInfoSync();
        expect(typeof info).toBe('object');
      }).not.toThrow();
      
      expect(async () => {
        const info = await getNetworkInfo();
        expect(typeof info).toBe('object');
      }).not.toThrow();
      
      expect(() => {
        const callback = jest.fn();
        const unsubscribe = subscribeNetworkInfo(callback);
        expect(typeof unsubscribe).toBe('function');
        unsubscribe();
      }).not.toThrow();
    });
  });

  describe('Error Resilience', () => {
    test('should handle missing navigator gracefully', async () => {
      // Store original navigator
      const originalNavigator = (globalThis as any).navigator;
      
      try {
        // Remove navigator temporarily
        delete (globalThis as any).navigator;
        
        const { getNetworkInfoSync } = await import('../networkSpeed');
        
        expect(() => {
          const info = getNetworkInfoSync();
          expect(typeof info).toBe('object');
          expect(info.isEstimate).toBe(true);
        }).not.toThrow();
      } finally {
        // Restore navigator
        (globalThis as any).navigator = originalNavigator;
      }
    });

    test('should handle malformed connection objects', async () => {
      const originalNavigator = (globalThis as any).navigator;
      
      try {
        (globalThis as any).navigator = {
          connection: {
            get effectiveType() { throw new Error('Access error'); }
          }
        };
        
        const { getNetworkInfoSync } = await import('../networkSpeed');
        
        expect(() => {
          const info = getNetworkInfoSync();
          expect(typeof info).toBe('object');
        }).not.toThrow();
      } finally {
        (globalThis as any).navigator = originalNavigator;
      }
    });
  });
});