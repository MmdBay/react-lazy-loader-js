import MinHeap from '../MinHeap';

describe('MinHeap', () => {
  let heap: MinHeap<string>;

  beforeEach(() => {
    heap = new MinHeap<string>();
  });

  describe('Basic Operations', () => {
    test('should initialize as empty heap', () => {
      expect(heap.isEmpty()).toBe(true);
    });

    test('should add items and maintain min heap property', () => {
      heap.push('a', 5);
      heap.push('b', 3);
      heap.push('c', 7);
      heap.push('d', 1);

      expect(heap.isEmpty()).toBe(false);
      
      // Should return minimum frequency item first
      const min = heap.pop();
      expect(min?.key).toBe('d');
      expect(min?.frequency).toBe(1);
    });

    test('should pop items in correct order (min frequency first)', () => {
      const items = [
        { key: 'item1', freq: 10 },
        { key: 'item2', freq: 5 },
        { key: 'item3', freq: 15 },
        { key: 'item4', freq: 2 },
        { key: 'item5', freq: 8 }
      ];

      // Add items
      items.forEach(item => heap.push(item.key, item.freq));

      // Pop items and verify they come out in ascending frequency order
      const poppedItems = [];
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) poppedItems.push(item);
      }

      expect(poppedItems.map(item => item.frequency)).toEqual([2, 5, 8, 10, 15]);
    });

    test('should return undefined when popping from empty heap', () => {
      expect(heap.pop()).toBeUndefined();
    });
  });

  describe('Remove Operations', () => {
    beforeEach(() => {
      heap.push('a', 5);
      heap.push('b', 3);
      heap.push('c', 7);
      heap.push('d', 1);
      heap.push('e', 9);
    });

    test('should remove specific key from heap', () => {
      heap.remove('c'); // Remove middle element
      
      const remaining = [];
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) remaining.push(item.key);
      }
      
      expect(remaining).not.toContain('c');
      expect(remaining).toEqual(['d', 'b', 'a', 'e']);
    });

    test('should handle removing non-existent key gracefully', () => {
      heap.remove('nonexistent');
      
      // Heap should remain unchanged
      const min = heap.pop();
      expect(min?.key).toBe('d');
      expect(min?.frequency).toBe(1);
    });

    test('should remove root element correctly', () => {
      heap.remove('d'); // Remove root (minimum element)
      
      const newMin = heap.pop();
      expect(newMin?.key).toBe('b');
      expect(newMin?.frequency).toBe(3);
    });

    test('should remove last element correctly', () => {
      heap.remove('e'); // Remove last element
      
      const items = [];
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) items.push(item.frequency);
      }
      
      expect(items).toEqual([1, 3, 5, 7]);
    });
  });

  describe('Update Frequency Operations', () => {
    beforeEach(() => {
      heap.push('a', 5);
      heap.push('b', 3);
      heap.push('c', 7);
      heap.push('d', 1);
    });

    test('should update frequency and maintain heap property', () => {
      // Update 'd' from frequency 1 to 10 (should move down)
      heap.updateFrequency('d', 10);
      
      const min = heap.pop();
      expect(min?.key).toBe('b'); // 'b' should now be minimum with frequency 3
      expect(min?.frequency).toBe(3);
    });

    test('should update frequency of non-root element', () => {
      // Update 'c' from frequency 7 to 2 (should move up)
      heap.updateFrequency('c', 2);
      
      const min = heap.pop();
      expect(min?.key).toBe('d'); // 'd' still minimum with frequency 1
      
      const secondMin = heap.pop();
      expect(secondMin?.key).toBe('c'); // 'c' should be second with frequency 2
      expect(secondMin?.frequency).toBe(2);
    });

    test('should handle updating non-existent key gracefully', () => {
      heap.updateFrequency('nonexistent', 100);
      
      // Heap should remain unchanged
      const min = heap.pop();
      expect(min?.key).toBe('d');
      expect(min?.frequency).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle single element heap', () => {
      heap.push('only', 42);
      
      expect(heap.isEmpty()).toBe(false);
      
      const item = heap.pop();
      expect(item?.key).toBe('only');
      expect(item?.frequency).toBe(42);
      
      expect(heap.isEmpty()).toBe(true);
    });

    test('should handle elements with same frequency', () => {
      heap.push('a', 5);
      heap.push('b', 5);
      heap.push('c', 5);
      
      // All elements have same frequency, any order is valid for min heap
      const items = [];
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) {
          items.push(item.frequency);
        }
      }
      
      expect(items).toEqual([5, 5, 5]);
    });

    test('should handle large number of operations', () => {
      const n = 1000;
      
      // Add many items
      for (let i = 0; i < n; i++) {
        heap.push(`item${i}`, Math.floor(Math.random() * 100));
      }
      
      // Remove some items
      for (let i = 0; i < n / 4; i++) {
        heap.remove(`item${i * 4}`);
      }
      
      // Update some frequencies
      for (let i = 0; i < n / 8; i++) {
        heap.updateFrequency(`item${i * 8 + 1}`, Math.floor(Math.random() * 50));
      }
      
      // Pop all remaining items and verify they come out in ascending order
      let lastFrequency = -1;
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) {
          expect(item.frequency).toBeGreaterThanOrEqual(lastFrequency);
          lastFrequency = item.frequency;
        }
      }
    });
  });

  describe('Heap Property Validation', () => {
    test('should maintain heap property after complex operations', () => {
      // Add items
      heap.push('a', 10);
      heap.push('b', 5);
      heap.push('c', 15);
      heap.push('d', 3);
      heap.push('e', 8);
      heap.push('f', 12);
      
      // Remove middle element
      heap.remove('e');
      
      // Update frequencies
      heap.updateFrequency('c', 2);
      heap.updateFrequency('a', 20);
      
      // Add more items
      heap.push('g', 1);
      heap.push('h', 6);
      
      // Pop all items and verify ascending order
      const frequencies = [];
      while (!heap.isEmpty()) {
        const item = heap.pop();
        if (item) {
          frequencies.push(item.frequency);
        }
      }
      
      // Check that frequencies are in ascending order
      for (let i = 1; i < frequencies.length; i++) {
        expect(frequencies[i]).toBeGreaterThanOrEqual(frequencies[i - 1]);
      }
    });
  });
});
