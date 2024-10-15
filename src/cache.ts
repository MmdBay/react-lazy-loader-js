/**
 * @class LFUCache
 * @description Implements a Least Frequently Used (LFU) cache with Time To Live (TTL) expiration.
 *              When the cache reaches its capacity, the least frequently used items are evicted.
 *              Items are also evicted if they are older than the TTL (Time To Live) value.
 * @template K - Key type.
 * @template V - Value type.
 */
export class LFUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; expiry: number; frequency: number }>;
  private ttl: number; // Time to live in milliseconds

  /**
   * @constructor
   * @param {number} capacity - Maximum number of items the cache can hold.
   * @param {number} ttl - Time in milliseconds before a cached item is considered expired.
   */
  constructor(capacity: number, ttl: number) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map<K, { value: V; expiry: number; frequency: number }>();
  }

  /**
   * @method get
   * @description Retrieves an item from the cache if it exists and is not expired. Increases its frequency count.
   * @param {K} key - The key of the item to retrieve.
   * @returns {V | undefined} The cached value if found and not expired, otherwise undefined.
   */
  get(key: K): V | undefined {
    const cacheItem = this.cache.get(key);
    
    // If the item does not exist or has expired, return undefined
    if (!cacheItem || Date.now() > cacheItem.expiry) {
      if (cacheItem) {
        this.cache.delete(key); // Remove expired items
      }
      return undefined;
    }

    // Increase the frequency count since it's being accessed
    cacheItem.frequency += 1;

    return cacheItem.value;
  }

  /**
   * @method set
   * @description Adds an item to the cache. If the cache exceeds its capacity, the least frequently used item is removed.
   *              The item will also expire based on the TTL value.
   * @param {K} key - The key of the item to store.
   * @param {V} value - The value of the item to store.
   * @returns {void}
   */
  set(key: K, value: V): void {
    // If the key already exists, delete it first to update the position
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // If the cache exceeds capacity, remove the least frequently used item
    if (this.cache.size === this.capacity) {
      this.evictLeastFrequentlyUsed();
    }

    // Add the new item with the current time plus TTL as the expiry time
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
      frequency: 1 // Initial frequency is 1 since it has been added
    });
  }

  /**
   * @method evictLeastFrequentlyUsed
   * @description Finds and removes the least frequently used item from the cache.
   * @returns {void}
   */
  private evictLeastFrequentlyUsed(): void {
    let leastFrequentKey: K | null = null;
    let leastFrequency = Infinity;

    // Iterate through the cache to find the least frequently used item
    for (const [key, cacheItem] of this.cache.entries()) {
      if (cacheItem.frequency < leastFrequency) {
        leastFrequency = cacheItem.frequency;
        leastFrequentKey = key;
      }
    }

    // Remove the least frequently used item
    if (leastFrequentKey !== null) {
      this.cache.delete(leastFrequentKey);
    }
  }

  /**
   * @method displayCache
   * @description For debugging purposes, logs the current state of the cache.
   * @returns {void}
   */
  displayCache(): void {
    console.log(this.cache);
  }

  /**
   * @method cleanUp
   * @description Cleans up expired items from the cache.
   * @returns {void}
   */
  cleanUp(): void {
    const now = Date.now();
    for (const [key, cacheItem] of this.cache.entries()) {
      if (cacheItem.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
}


