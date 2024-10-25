import MinHeap from './MinHeap' // Bringing in our MinHeap, which helps us keep track of the least-used stuff

/**
 * This is the `LFUCache` class. It’s basically a "Least Frequently Used" cache,
 * so if something hasn’t been used in a while, we’re gonna kick it out first.
 * Oh, and we also keep track of how long stuff is good for with TTL (Time To Live).
 */
export class LFUCache<K, V> {
  // The cache has a `capacity` (how much stuff we can store) and a `ttl` (how long each item lasts).
  // `cache` is where we store the items, and `heap` is where we track their usage frequency.
  private capacity: number;
  private cache: Map<K, { value: V; expiry: number; frequency: number }>; // Map to hold our cache items
  private ttl: number; // Time to Live: how long each item stays valid
  private heap: MinHeap<K>; // MinHeap helps us keep track of the least frequently used items

  // In the constructor, we set the capacity and TTL for the cache.
  constructor(capacity: number, ttl: number) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = new Map<K, { value: V; expiry: number; frequency: number }>(); // This is where our key-value pairs live
    this.heap = new MinHeap<K>(); // This keeps track of usage frequency
  }

  /**
   * `get` is how we grab an item from the cache. If it's still valid (not expired),
   * we return it and increase its frequency because, well, we just used it.
   */
  get(key: K): V | undefined {
    const cacheItem = this.cache.get(key); // Grab the item from the cache
    if (!cacheItem || Date.now() > cacheItem.expiry) { // If it’s expired or doesn’t exist, remove it
      if (cacheItem) {
        this.cache.delete(key); // Outdated, so let’s delete it from the cache
        this.heap.remove(key); // Also, remove it from the heap
      }
      return undefined; // Item’s no good, so return undefined
    }
    cacheItem.frequency++; // If it’s still good, bump up its frequency because we just used it
    this.heap.updateFrequency(key, cacheItem.frequency); // Update its position in the heap
    return cacheItem.value; // Return the value since it's still valid
  }

  /**
   * `set` adds a new item to the cache. If we’re at full capacity, we gotta kick out 
   * the least-used item to make space. If the item already exists, we just update it.
   */
  set(key: K, value: V): void {
    if (this.cache.has(key)) { // If the item’s already in the cache, delete it first
      this.cache.delete(key);
      this.heap.remove(key);
    }
    if (this.cache.size === this.capacity) { // If we’re at capacity, evict the least-used item
      this.evictLeastFrequentlyUsed();
    }
    const newItem = { // Create a new cache entry with the value, TTL, and an initial frequency of 1
      value,
      expiry: Date.now() + this.ttl, // Set when this item should expire
      frequency: 1 // New items start with a frequency of 1
    };
    this.cache.set(key, newItem); // Add the item to the cache
    this.heap.push(key, newItem.frequency); // Add it to the heap too, to track its frequency
  }

  /**
   * `evictLeastFrequentlyUsed` kicks out the item that’s been used the least.
   * We call this when the cache is full and we need space for new stuff.
   */
  private evictLeastFrequentlyUsed(): void {
    const leastFrequentKey = this.heap.pop(); // Grab the least-used key from the heap
    if (leastFrequentKey) {
      this.cache.delete(leastFrequentKey.key); // Remove it from the cache
    }
  }
}
