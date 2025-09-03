import MinHeap from './MinHeap';

/**
 * LFU (Least Frequently Used) cache implementation with TTL support.
 * Evicts the least frequently used items when capacity is reached.
 * Items also expire based on their Time To Live (TTL).
 */
export class LFUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; expiry: number; frequency: number }>;
  private ttl: number; // Time to Live in milliseconds
  private heap: MinHeap<K>; // Tracks frequency for efficient LFU eviction

  constructor(capacity: number, ttl: number) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map<K, { value: V; expiry: number; frequency: number }>();
    this.heap = new MinHeap<K>();
  }

  /**
   * Retrieve an item from the cache. Updates frequency on access and removes expired items.
   */
  get(key: K): V | undefined {
    const cacheItem = this.cache.get(key);
    if (!cacheItem || Date.now() > cacheItem.expiry) {
      if (cacheItem) {
        this.cache.delete(key);
        this.heap.remove(key);
      }
      return undefined;
    }
    cacheItem.frequency++;
    this.heap.updateFrequency(key, cacheItem.frequency);
    return cacheItem.value;
  }

  /**
   * Add or update an item in the cache. Evicts least frequently used item if at capacity.
   */
  set(key: K, value: V): void {
    // If capacity is 0, don't store anything
    if (this.capacity === 0) {
      return;
    }

    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.heap.remove(key);
    }
    if (this.cache.size >= this.capacity) {
      this.evictLeastFrequentlyUsed();
    }
    const newItem = {
      value,
      expiry: Date.now() + this.ttl,
      frequency: 1
    };
    this.cache.set(key, newItem);
    this.heap.push(key, newItem.frequency);
  }

  /**
   * Remove the least frequently used item from the cache to make space for new items.
   */
  private evictLeastFrequentlyUsed(): void {
    const leastFrequentKey = this.heap.pop();
    if (leastFrequentKey) {
      this.cache.delete(leastFrequentKey.key);
    }
  }
}
