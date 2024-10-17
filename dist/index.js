"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  prefetchDynamicImport: () => prefetchDynamicImport,
  priorityLoadComponent: () => priorityLoadComponent,
  retryDynamicImport: () => retryDynamicImport
});
module.exports = __toCommonJS(src_exports);

// src/retry.ts
var import_react = require("react");

// src/config.ts
var defaultConfig = {
  maxRetryCount: 15,
  initialRetryDelayMs: 500,
  maxRetryDelayMs: 5e3,
  timeoutMs: 3e4,
  circuitBreakerThreshold: 5,
  resetTimeMs: 3e4
};

// src/utils.ts
var getRouteComponentUrl = (originalImport) => {
  var _a;
  try {
    const fnString = originalImport.toString();
    return ((_a = fnString.match(/import\(["']([^)]+)['"]\)/)) == null ? void 0 : _a[1]) || null;
  } catch (e) {
    return null;
  }
};
var getRetryImportFunction = (originalImport, retryCount) => {
  const importUrl = getRouteComponentUrl(originalImport);
  if (!importUrl || retryCount === 0) return originalImport;
  const importUrlWithVersionQuery = importUrl.includes("?") ? `${importUrl}&v=${retryCount}-${Math.random().toString(36).substring(2)}` : `${importUrl}?v=${retryCount}-${Math.random().toString(36).substring(2)}`;
  return () => import(importUrlWithVersionQuery);
};

// src/cache.ts
var LFUCache = class {
  // Time to live in milliseconds
  /**
   * @constructor
   * @param {number} capacity - Maximum number of items the cache can hold.
   * @param {number} ttl - Time in milliseconds before a cached item is considered expired.
   */
  constructor(capacity, ttl) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * @method get
   * @description Retrieves an item from the cache if it exists and is not expired. Increases its frequency count.
   * @param {K} key - The key of the item to retrieve.
   * @returns {V | undefined} The cached value if found and not expired, otherwise undefined.
   */
  get(key) {
    const cacheItem = this.cache.get(key);
    if (!cacheItem || Date.now() > cacheItem.expiry) {
      if (cacheItem) {
        this.cache.delete(key);
      }
      return void 0;
    }
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
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    if (this.cache.size === this.capacity) {
      this.evictLeastFrequentlyUsed();
    }
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl,
      frequency: 1
      // Initial frequency is 1 since it has been added
    });
  }
  /**
   * @method evictLeastFrequentlyUsed
   * @description Finds and removes the least frequently used item from the cache.
   * @returns {void}
   */
  evictLeastFrequentlyUsed() {
    let leastFrequentKey = null;
    let leastFrequency = Infinity;
    for (const [key, cacheItem] of this.cache.entries()) {
      if (cacheItem.frequency < leastFrequency) {
        leastFrequency = cacheItem.frequency;
        leastFrequentKey = key;
      }
    }
    if (leastFrequentKey !== null) {
      this.cache.delete(leastFrequentKey);
    }
  }
  /**
   * @method displayCache
   * @description For debugging purposes, logs the current state of the cache.
   * @returns {void}
   */
  displayCache() {
    console.log(this.cache);
  }
  /**
   * @method cleanUp
   * @description Cleans up expired items from the cache.
   * @returns {void}
   */
  cleanUp() {
    const now = Date.now();
    for (const [key, cacheItem] of this.cache.entries()) {
      if (cacheItem.expiry <= now) {
        this.cache.delete(key);
      }
    }
  }
};

// src/circuitBreaker.ts
var handleFailureWithCircuitBreaker = (retryCount, { circuitBreakerThreshold, resetTimeMs }) => {
  if (retryCount >= circuitBreakerThreshold) {
    setTimeout(() => retryCount = 0, resetTimeMs);
    return true;
  }
  return false;
};

// src/retry.ts
var lfuCache = new LFUCache(5, 36e5);
function retryDynamicImport(importFunction, config = defaultConfig) {
  let retryCount = 0;
  let hasTimedOut = false;
  const { maxRetryCount, timeoutMs } = config;
  const loadComponent = () => new Promise((resolve, reject) => {
    const importUrl = getRouteComponentUrl(importFunction);
    const cachedComponent = importUrl ? lfuCache.get(importUrl) : null;
    if (cachedComponent) {
      resolve(cachedComponent);
      return;
    }
    const timeoutId = setTimeout(() => {
      hasTimedOut = true;
      reject(new Error("Component load timed out."));
    }, timeoutMs);
    function tryLoadComponent() {
      if (hasTimedOut) return;
      const retryImport = getRetryImportFunction(importFunction, retryCount);
      retryImport().then((module2) => {
        clearTimeout(timeoutId);
        if (importUrl) {
          lfuCache.set(importUrl, module2);
        }
        resolve(module2);
      }).catch((error) => {
        retryCount += 1;
        if (handleFailureWithCircuitBreaker(retryCount, config)) {
          reject(error);
          return;
        }
        if (retryCount <= maxRetryCount) {
          setTimeout(tryLoadComponent, retryCount * config.initialRetryDelayMs);
        } else {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    }
    tryLoadComponent();
  });
  return (0, import_react.lazy)(() => loadComponent());
}
var prefetchDynamicImport = (importFunction) => {
  const retryImport = getRetryImportFunction(importFunction, 0);
  retryImport().then((module2) => console.log("Component prefetched successfully.")).catch((error) => console.warn("Prefetching component failed:", error));
};
var priorityLoadComponent = (importFunction, priority) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1e3);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  prefetchDynamicImport,
  priorityLoadComponent,
  retryDynamicImport
});
