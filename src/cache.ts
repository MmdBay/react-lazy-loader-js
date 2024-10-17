import MinHeap from './MinHeap'

/**
 * LFUCache class that implements the Least Frequently Used (LFU) caching strategy
 * with Time To Live (TTL) support for cache entries.
 */
export class LFUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; expiry: number; frequency: number }>;
  private ttl: number;
  private heap: MinHeap<K>;

  constructor(capacity: number, ttl: number) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map<K, { value: V; expiry: number; frequency: number }>();
    this.heap = new MinHeap<K>();
  }

  /**
   * Retrieves a value from the cache if it is not expired and increases its frequency.
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
   * Adds a value to the cache. Evicts the least frequently used item if the cache is at capacity.
   */
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.heap.remove(key);
    }
    if (this.cache.size === this.capacity) {
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
   * Evicts the least frequently used item from the cache using the heap.
   */
  private evictLeastFrequentlyUsed(): void {
    const leastFrequentKey = this.heap.pop();
    if (leastFrequentKey) {
      this.cache.delete(leastFrequentKey.key);
    }
  }
}
