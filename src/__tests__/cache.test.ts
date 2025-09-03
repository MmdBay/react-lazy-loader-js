import { LFUCache } from '../cache';

describe('LFUCache', () => {
  let cache: LFUCache<string, string>;
  const defaultTTL = 60000; // 1 minute

  beforeEach(() => {
    cache = new LFUCache<string, string>(3, defaultTTL);
  });

  describe('Basic Operations', () => {
    test('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return undefined for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    test('should update existing keys', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'updated-value1');
      expect(cache.get('key1')).toBe('updated-value1');
    });
  });

  describe('LFU Eviction Policy', () => {
    test('should evict least frequently used item when capacity is exceeded', () => {
      // Fill cache to capacity
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access key1 and key3 to increase their frequency
      cache.get('key1');
      cache.get('key3');
      
      // Add new item - should evict key2 (least frequently used)
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBe('value1'); // Still exists
      expect(cache.get('key2')).toBeUndefined(); // Evicted
      expect(cache.get('key3')).toBe('value3'); // Still exists
      expect(cache.get('key4')).toBe('value4'); // Newly added
    });

    test('should track frequency correctly', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Access keys different number of times
      cache.get('key1'); // frequency: 2
      cache.get('key2'); // frequency: 2
      cache.get('key2'); // frequency: 3
      cache.get('key3'); // frequency: 2
      cache.get('key3'); // frequency: 3
      cache.get('key3'); // frequency: 4
      
      // Add new item - should evict key1 (lowest frequency)
      cache.set('key4', 'value4');
      
      expect(cache.get('key1')).toBeUndefined(); // Evicted (frequency was 2)
      expect(cache.get('key2')).toBe('value2'); // Still exists (frequency was 3)
      expect(cache.get('key3')).toBe('value3'); // Still exists (frequency was 4)
      expect(cache.get('key4')).toBe('value4'); // Newly added
    });

    test('should handle ties in frequency by evicting any of the tied items', () => {
      // All items have same frequency
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      
      // Add new item - should evict one of the existing items
      cache.set('key4', 'value4');
      
      // Count how many of the original items still exist
      const existingCount = [
        cache.get('key1'),
        cache.get('key2'),
        cache.get('key3')
      ].filter(val => val !== undefined).length;
      
      expect(existingCount).toBe(2); // One should be evicted
      expect(cache.get('key4')).toBe('value4'); // New item exists
    });
  });

  describe('TTL (Time To Live)', () => {
    test('should expire items after TTL', (done) => {
      const shortTTL = 100; // 100ms
      const shortTTLCache = new LFUCache<string, string>(3, shortTTL);
      
      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.get('key1')).toBe('value1');
      
      setTimeout(() => {
        expect(shortTTLCache.get('key1')).toBeUndefined();
        done();
      }, shortTTL + 50);
    });

    test('should remove expired items from cache and heap', (done) => {
      const shortTTL = 100;
      const shortTTLCache = new LFUCache<string, string>(2, shortTTL);
      
      shortTTLCache.set('expired', 'value');
      
      setTimeout(() => {
        // Set a valid item after the first one should have expired
        shortTTLCache.set('valid', 'value');
        
        // Try to access expired item
        expect(shortTTLCache.get('expired')).toBeUndefined();
        
        // Valid item should still exist
        expect(shortTTLCache.get('valid')).toBe('value');
        
        // Should be able to add new item without eviction since expired was removed
        shortTTLCache.set('new', 'value');
        expect(shortTTLCache.get('new')).toBe('value');
        expect(shortTTLCache.get('valid')).toBe('value');
        
        done();
      }, shortTTL + 50);
    }, 10000);

    test('should refresh TTL on set operation', (done) => {
      const shortTTL = 200;
      const shortTTLCache = new LFUCache<string, string>(3, shortTTL);
      
      shortTTLCache.set('key1', 'value1');
      
      setTimeout(() => {
        // Update the key before it expires
        shortTTLCache.set('key1', 'updated-value1');
        
        setTimeout(() => {
          // Should still exist because TTL was refreshed
          expect(shortTTLCache.get('key1')).toBe('updated-value1');
          done();
        }, shortTTL / 2);
        
      }, shortTTL / 2);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero capacity cache', () => {
      const zeroCache = new LFUCache<string, string>(0, defaultTTL);
      
      // With zero capacity, items should be immediately evicted
      zeroCache.set('key1', 'value1');
      // The item should be evicted immediately due to zero capacity
      expect(zeroCache.get('key1')).toBeUndefined();
    });

    test('should handle single capacity cache', () => {
      const singleCache = new LFUCache<string, string>(1, defaultTTL);
      
      singleCache.set('key1', 'value1');
      expect(singleCache.get('key1')).toBe('value1');
      
      singleCache.set('key2', 'value2');
      expect(singleCache.get('key1')).toBeUndefined(); // Evicted
      expect(singleCache.get('key2')).toBe('value2');
    });

    test('should handle different data types', () => {
      const mixedCache = new LFUCache<string, any>(3, defaultTTL);
      
      mixedCache.set('string', 'text');
      mixedCache.set('number', 42);
      mixedCache.set('object', { name: 'test', value: 123 });
      
      expect(mixedCache.get('string')).toBe('text');
      expect(mixedCache.get('number')).toBe(42);
      expect(mixedCache.get('object')).toEqual({ name: 'test', value: 123 });
    });

    test('should handle numeric keys', () => {
      const numericCache = new LFUCache<number, string>(3, defaultTTL);
      
      numericCache.set(1, 'one');
      numericCache.set(2, 'two');
      numericCache.set(3, 'three');
      
      expect(numericCache.get(1)).toBe('one');
      expect(numericCache.get(2)).toBe('two');
      expect(numericCache.get(3)).toBe('three');
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle mixed operations correctly', () => {
      // Fill cache
      cache.set('a', 'valueA');
      cache.set('b', 'valueB');
      cache.set('c', 'valueC');
      
      // Create access pattern
      cache.get('a'); // a: frequency 2
      cache.get('b'); // b: frequency 2
      cache.get('a'); // a: frequency 3
      
      // Update existing key
      cache.set('b', 'updatedB'); // b: frequency 1 (reset on update)
      
      // Add new key (will cause eviction)
      cache.set('d', 'valueD');
      
      expect(cache.get('a')).toBe('valueA'); // frequency 3, should exist
      expect(cache.get('d')).toBe('valueD'); // newly added
      
      // Due to LFU policy, either 'b' or 'c' might be evicted (both have frequency 1)
      // We just check that the cache is still at capacity
      const remainingItems = ['a', 'b', 'c', 'd']
        .map(key => cache.get(key))
        .filter(val => val !== undefined);
      expect(remainingItems.length).toBe(3); // Should be at capacity
    });

    test('should handle rapid successive operations', () => {
      const keys = ['key1', 'key2', 'key3', 'key4', 'key5'];
      
      // Add items beyond capacity
      keys.forEach((key, index) => {
        cache.set(key, `value${index + 1}`);
      });
      
      // Count remaining items - should be at capacity (3)
      const remainingItems = keys
        .map(key => cache.get(key))
        .filter(val => val !== undefined);
      expect(remainingItems.length).toBe(3);
      
      // The last items added should likely still be there due to LFU policy
      expect(cache.get('key5')).toBe('value5');
    });

    test('should maintain consistency during high-frequency operations', () => {
      const iterations = 100;
      
      for (let i = 0; i < iterations; i++) {
        const key = `key${i % 5}`; // Cycle through 5 keys
        cache.set(key, `value${i}`);
        
        if (i % 3 === 0) {
          cache.get(key); // Increase frequency of some items
        }
      }
      
      // Cache should contain some items without throwing errors
      const remainingItems = ['key0', 'key1', 'key2', 'key3', 'key4']
        .map(key => cache.get(key))
        .filter(value => value !== undefined);
      
      expect(remainingItems.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Performance Characteristics', () => {
    test('should handle large number of operations efficiently', () => {
      const largeCache = new LFUCache<string, string>(1000, defaultTTL);
      const startTime = Date.now();
      
      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        largeCache.set(`key${i}`, `value${i}`);
        if (i % 3 === 0) {
          largeCache.get(`key${Math.floor(i / 2)}`);
        }
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });
  });
});
