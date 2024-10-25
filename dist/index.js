"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  LazyLoader: () => LazyLoader,
  prefetchDynamicImport: () => prefetchDynamicImport,
  priorityLoadComponent: () => priorityLoadComponent,
  retryDynamicImport: () => retryDynamicImport
});
module.exports = __toCommonJS(src_exports);

// src/networkSpeed.ts
function getNetworkInfo() {
  const connection = navigator.connection;
  if (connection) {
    const { effectiveType, downlink, saveData } = connection;
    return { effectiveType, downlink, saveData };
  }
  return { effectiveType: "unknown", downlink: 0, saveData: false };
}

// src/retry.tsx
var import_react2 = __toESM(require("react"));

// src/config.ts
var defaultConfig = {
  circuitBreakerThreshold: 5,
  // This is like, “Yo, after 5 fails, stop trying. Take a break.”
  resetTimeMs: 3e4,
  // We’ll chill for 30 seconds before we give it another go.
  maxRetryCount: 15,
  // If we fail, we’ll try again up to 15 times before throwing in the towel.
  initialRetryDelayMs: 500,
  // On the first fail, we’ll wait half a second before trying again.
  maxRetryDelayMs: 5e3,
  // But if we keep failing, the wait time can go up to 5 seconds between retries.
  timeoutMs: 3e4
  // And if a task takes more than 30 seconds, we say, "Forget it!"
};
function getConfig(overrides) {
  return __spreadValues(__spreadValues({}, defaultConfig), overrides);
}

// src/MinHeap.ts
var MinHeap = class {
  /**
   * When we create a new `MinHeap`, we’re just starting with an empty heap and an empty positions map.
   * This is like resetting everything.
   */
  constructor() {
    this.heap = [];
    this.positions = /* @__PURE__ */ new Map();
  }
  /**
   * `push` is how we add a new key to the heap. We toss in the key and its frequency, 
   * stick it at the end of the heap, and then make sure the heap stays in the right order by "bubbling it up."
   */
  push(key, frequency) {
    const node = { key, frequency, index: this.heap.length };
    this.heap.push(node);
    this.positions.set(key, node.index);
    this.bubbleUp(this.heap.length - 1);
  }
  /**
   * `pop` is where we grab the key with the lowest frequency. 
   * It's always gonna be the one at the top of the heap.
   * After we grab it, we swap it with the last item in the heap, remove it, and then "bubble down" to restore order.
   */
  pop() {
    if (this.isEmpty()) return void 0;
    const minItem = this.heap[0];
    this.swap(0, this.heap.length - 1);
    this.heap.pop();
    this.positions.delete(minItem.key);
    this.bubbleDown(0);
    return minItem;
  }
  /**
   * `remove` is used to kick out a specific key. 
   * We find the key, swap it with the last item, remove it, and then rebalance the heap 
   * by either bubbling up or down as needed.
   */
  remove(key) {
    if (!this.positions.has(key)) return;
    const indexToRemove = this.positions.get(key);
    const lastIndex = this.heap.length - 1;
    if (indexToRemove !== lastIndex) {
      this.swap(indexToRemove, lastIndex);
      this.heap.pop();
      this.positions.delete(key);
      this.bubbleDown(indexToRemove);
      this.bubbleUp(indexToRemove);
    } else {
      this.heap.pop();
      this.positions.delete(key);
    }
  }
  /**
   * `updateFrequency` is used when a key's frequency changes. 
   * We update its frequency and rebalance the heap by bubbling up or down, as needed.
   */
  updateFrequency(key, frequency) {
    if (this.positions.has(key)) {
      const index = this.positions.get(key);
      this.heap[index].frequency = frequency;
      this.bubbleDown(index);
      this.bubbleUp(index);
    }
  }
  /**
   * `bubbleUp` moves a node up the heap if its frequency is too small. 
   * We keep swapping it with its parent until it's in the right spot.
   */
  bubbleUp(index) {
    let current = index;
    let parentIdx = this.getParentIndex(current);
    while (current > 0 && this.heap[current].frequency < this.heap[parentIdx].frequency) {
      this.swap(current, parentIdx);
      current = parentIdx;
      parentIdx = this.getParentIndex(current);
    }
  }
  /**
   * `bubbleDown` moves a node down the heap if its frequency is too big. 
   * We keep swapping it with the smaller child until it's in the right spot.
   */
  bubbleDown(index) {
    let current = index;
    let left = this.getLeftChildIndex(current);
    let right = this.getRightChildIndex(current);
    let smallest = current;
    if (left < this.heap.length && this.heap[left].frequency < this.heap[smallest].frequency) {
      smallest = left;
    }
    if (right < this.heap.length && this.heap[right].frequency < this.heap[smallest].frequency) {
      smallest = right;
    }
    if (smallest !== current) {
      this.swap(current, smallest);
      this.bubbleDown(smallest);
    }
  }
  /**
   * `swap` switches two items in the heap and updates their positions in the map.
   */
  swap(index1, index2) {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
    this.heap[index1].index = index1;
    this.heap[index2].index = index2;
    this.positions.set(this.heap[index1].key, index1);
    this.positions.set(this.heap[index2].key, index2);
  }
  /**
   * `getParentIndex` is just a little helper to find the parent index of a node.
   * If you're at index i, your parent is at (i-1)/2.
   */
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }
  /**
   * `getLeftChildIndex` gives you the index of the left child.
   * If you're at index i, your left child is at 2*i + 1.
   */
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }
  /**
   * `getRightChildIndex` gives you the index of the right child.
   * If you're at index i, your right child is at 2*i + 2.
   */
  getRightChildIndex(index) {
    return 2 * index + 2;
  }
  /**
   * `isEmpty` is just a simple check to see if the heap is empty.
   * If the heap is empty, we return true.
   */
  isEmpty() {
    return this.heap.length === 0;
  }
};

// src/cache.ts
var LFUCache = class {
  // MinHeap helps us keep track of the least frequently used items
  // In the constructor, we set the capacity and TTL for the cache.
  constructor(capacity, ttl) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = /* @__PURE__ */ new Map();
    this.heap = new MinHeap();
  }
  /**
   * `get` is how we grab an item from the cache. If it's still valid (not expired),
   * we return it and increase its frequency because, well, we just used it.
   */
  get(key) {
    const cacheItem = this.cache.get(key);
    if (!cacheItem || Date.now() > cacheItem.expiry) {
      if (cacheItem) {
        this.cache.delete(key);
        this.heap.remove(key);
      }
      return void 0;
    }
    cacheItem.frequency++;
    this.heap.updateFrequency(key, cacheItem.frequency);
    return cacheItem.value;
  }
  /**
   * `set` adds a new item to the cache. If we’re at full capacity, we gotta kick out 
   * the least-used item to make space. If the item already exists, we just update it.
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.heap.remove(key);
    }
    if (this.cache.size === this.capacity) {
      this.evictLeastFrequentlyUsed();
    }
    const newItem = {
      // Create a new cache entry with the value, TTL, and an initial frequency of 1
      value,
      expiry: Date.now() + this.ttl,
      // Set when this item should expire
      frequency: 1
      // New items start with a frequency of 1
    };
    this.cache.set(key, newItem);
    this.heap.push(key, newItem.frequency);
  }
  /**
   * `evictLeastFrequentlyUsed` kicks out the item that’s been used the least.
   * We call this when the cache is full and we need space for new stuff.
   */
  evictLeastFrequentlyUsed() {
    const leastFrequentKey = this.heap.pop();
    if (leastFrequentKey) {
      this.cache.delete(leastFrequentKey.key);
    }
  }
};

// src/utils.ts
var routeCache = new LFUCache(100, 36e5);
var getRouteComponentUrl = (originalImport) => {
  const cachedUrl = routeCache.get(originalImport);
  if (cachedUrl) {
    return cachedUrl;
  }
  try {
    const fnString = originalImport.toString();
    const match = fnString.match(/import\(["']([^)]+)['"]\)/);
    const result = match ? match[1] : null;
    if (result) {
      routeCache.set(originalImport, result);
    }
    return result;
  } catch (error) {
    console.error("Error in getRouteComponentUrl:", error);
    return null;
  }
};
var getRetryImportFunction = (originalImport, retryCount) => {
  const importUrl = getRouteComponentUrl(originalImport);
  if (!importUrl || retryCount === 0) {
    return originalImport;
  }
  try {
    const url = new URL(importUrl, window.location.href);
    url.searchParams.append("v", `${retryCount}-${Math.random().toString(36).substring(2)}`);
    return () => import(
      /* @vite-ignore */
      url.toString()
    );
  } catch (error) {
    console.error("Error in getRetryImportFunction:", error);
    return originalImport;
  }
};

// src/circuitBreaker.ts
var CircuitBreaker = class {
  // How long we wait before trying again after breaking the circuit
  constructor(config) {
    // We’re keeping track of the number of failed retries (`retryCount`), 
    // whether the circuit is open (stopped trying) or half-open (kinda testing things out).
    this.retryCount = 0;
    this.isOpen = false;
    // When this is true, we stop making any attempts
    this.isHalfOpen = false;
    this.failureThreshold = config.circuitBreakerThreshold;
    this.resetTimeout = config.resetTimeMs;
    this.successThreshold = 2;
  }
  /**
   * This is the part where we handle failures.
   * If the number of retries is more than the failureThreshold, we "open" the circuit, 
   * which basically means we stop making further attempts for a while.
   */
  handleFailure() {
    if (this.isOpen) {
      console.log("Circuit breaker is open, rejecting further attempts.");
      return true;
    }
    this.retryCount += 1;
    console.log(`Failure detected, retry count: ${this.retryCount}`);
    if (this.retryCount >= this.failureThreshold) {
      this.openCircuit();
      return true;
    }
    return false;
  }
  /**
   * This handles successful attempts. If we're in the half-open state, 
   * we need to see a few successful retries before we can fully close the circuit and go back to normal.
   */
  handleSuccess() {
    if (this.isHalfOpen) {
      this.retryCount = 0;
      console.log(`Success detected in half-open state, retry count reset to 0.`);
      this.successThreshold -= 1;
      if (this.successThreshold <= 0) {
        this.closeCircuit();
        console.log("Circuit breaker is now closed after successful attempts.");
      }
    }
  }
  /**
   * When things go bad and we fail too many times, we "open" the circuit. 
   * This means we stop making further attempts for a bit and then move into the half-open state to test things.
   */
  openCircuit() {
    console.log("Circuit breaker is now open.");
    this.isOpen = true;
    setTimeout(() => {
      this.isOpen = false;
      this.isHalfOpen = true;
      console.log("Circuit breaker is now half-open, testing for stability.");
    }, this.resetTimeout);
  }
  /**
   * If things go well, we can "close" the circuit, which means we're fully operational again.
   */
  closeCircuit() {
    this.isHalfOpen = false;
    this.isOpen = false;
    this.retryCount = 0;
    console.log("Circuit breaker is now fully closed and operational.");
  }
  /**
   * This is just a quick check to see if the circuit breaker is open.
   * If it is, we’re not making any new attempts.
   */
  isCircuitOpen() {
    return this.isOpen;
  }
};

// src/LoadingSpinner.tsx
var import_react = __toESM(require("react"));
var Loader = ({
  size = 50,
  // If no size is provided, we default to 50px
  borderSize = 4,
  // Border thickness defaults to 4px
  color = "#000",
  // Default color is black
  speed = 1,
  // It rotates once every 1 second by default
  retries = 0,
  // Starts with 0 retries
  showRetries = true,
  // We show retries by default
  showNetworkInfo = true,
  // We also show network info by default
  customStyle = {}
  // No custom styles by default
}) => {
  const [networkInfo, setNetworkInfo] = (0, import_react.useState)({
    downlink: null,
    // Start with no info on download speed
    effectiveType: "unknown",
    // Start with an unknown connection type
    saveData: false
    // Assume data saver is off to start
  });
  const updateNetworkInfo = (0, import_react.useCallback)(() => {
    const info = getNetworkInfo();
    setNetworkInfo((prevInfo) => {
      if (info.downlink !== prevInfo.downlink || info.effectiveType !== prevInfo.effectiveType || info.saveData !== prevInfo.saveData) {
        return info;
      }
      return prevInfo;
    });
  }, []);
  (0, import_react.useEffect)(() => {
    updateNetworkInfo();
    const connection = navigator.connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener("change", updateNetworkInfo);
    }
    return () => {
      if (connection && connection.removeEventListener) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);
  return /* @__PURE__ */ import_react.default.createElement("div", { style: __spreadValues(__spreadValues({}, styles.loaderContainer), customStyle) }, " ", /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      style: __spreadProps(__spreadValues({}, styles.loader), {
        borderWidth: borderSize,
        // Spinner border thickness
        borderColor: `${color} transparent transparent transparent`,
        // Spinner color
        width: size,
        // Set the size of the spinner (width and height)
        height: size,
        animation: `spin ${speed}s linear infinite`
        // How fast it spins (based on `speed` prop)
      })
    }
  ), showRetries && /* @__PURE__ */ import_react.default.createElement("div", { style: styles.retryText }, "Retries: ", retries), showNetworkInfo && /* @__PURE__ */ import_react.default.createElement("div", { style: styles.networkInfo }, /* @__PURE__ */ import_react.default.createElement("div", null, "Speed: ", networkInfo.downlink !== null ? `${networkInfo.downlink} Mbps` : "Loading..."), /* @__PURE__ */ import_react.default.createElement("div", null, "Connection Type: ", networkInfo.effectiveType), /* @__PURE__ */ import_react.default.createElement("div", null, "Data Saver: ", networkInfo.saveData ? "Enabled" : "Disabled")));
};
var styles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    position: "absolute",
    top: 0,
    left: 0
  },
  loader: {
    borderRadius: "50%",
    borderStyle: "solid",
    boxSizing: "border-box"
  },
  retryText: {
    marginTop: 10,
    fontSize: "16px",
    color: "#000"
  },
  networkInfo: {
    marginTop: 5,
    fontSize: "14px",
    color: "#555",
    textAlign: "center"
  }
};
var LoadingSpinner_default = Loader;

// src/retry.tsx
var lfuCache = new LFUCache(5, 36e5);
function retryDynamicImport(importFunction, customConfig, loaderConfig) {
  const config = getConfig(customConfig);
  let retryCount = 0;
  let hasTimedOut = false;
  const { maxRetryCount, timeoutMs } = config;
  const circuitBreaker = new CircuitBreaker(config);
  const loadComponent = () => new Promise((resolve, reject) => {
    const { effectiveType, downlink } = getNetworkInfo();
    const adjustedRetryCount = downlink < 1 || effectiveType.includes("2g") ? maxRetryCount * 2 : maxRetryCount;
    const adjustedDelay = downlink < 1 || effectiveType.includes("2g") ? config.initialRetryDelayMs * 2 : config.initialRetryDelayMs;
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
        if (circuitBreaker.handleFailure()) {
          reject(error);
          return;
        }
        if (retryCount <= adjustedRetryCount) {
          setTimeout(tryLoadComponent, retryCount * adjustedDelay);
        } else {
          clearTimeout(timeoutId);
          reject(error);
        }
      });
    }
    tryLoadComponent();
  });
  return (0, import_react2.lazy)(() => loadComponent());
}
var LazyLoader = ({ LazyComponent, retryCount, loaderConfig }) => /* @__PURE__ */ import_react2.default.createElement(
  import_react2.default.Suspense,
  {
    fallback: /* @__PURE__ */ import_react2.default.createElement(
      LoadingSpinner_default,
      {
        retries: retryCount,
        size: loaderConfig.size,
        borderSize: loaderConfig.borderSize,
        color: loaderConfig.color,
        speed: loaderConfig.speed,
        showRetries: loaderConfig.showRetries,
        showNetworkInfo: loaderConfig.showNetworkInfo,
        customStyle: loaderConfig.customStyle
      }
    )
  },
  /* @__PURE__ */ import_react2.default.createElement(LazyComponent, null),
  " "
);
var prefetchDynamicImport = (importFunction) => {
  const retryImport = getRetryImportFunction(importFunction, 0);
  retryImport().then((module2) => console.log("Component prefetched successfully.")).catch((error) => console.warn("Prefetching component failed:", error));
};
var priorityLoadComponent = (importFunction, priority) => {
  setTimeout(() => retryDynamicImport(importFunction), priority * 1e3);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  LazyLoader,
  prefetchDynamicImport,
  priorityLoadComponent,
  retryDynamicImport
});
