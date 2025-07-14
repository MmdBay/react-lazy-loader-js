var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/networkSpeed.ts
var cachedInfo = null;
var cacheTime = 0;
var CACHE_TTL = 3e4;
function getNavigatorConnection() {
  if (typeof navigator !== "undefined" && navigator.connection) {
    return navigator.connection;
  }
  return null;
}
function buildInfoFromAPI(conn) {
  var _a;
  return {
    effectiveType: conn.effectiveType || "unknown",
    type: conn.type,
    downlink: (_a = conn.downlink) != null ? _a : 0,
    downlinkMax: conn.downlinkMax,
    rtt: conn.rtt,
    saveData: !!conn.saveData,
    latency: conn.rtt,
    lastTested: Date.now(),
    isEstimate: false
  };
}
function estimateSpeedByImage() {
  return __async(this, null, function* () {
    const imageUrl = "https://www.google.com/images/phd/px.gif";
    const start = Date.now();
    let downlink = 0;
    let latency = 0;
    try {
      const before = Date.now();
      yield fetch(imageUrl, { cache: "no-store" });
      const after = Date.now();
      latency = after - before;
      downlink = Math.max(0.01, 43 * 8 / (latency / 1e3) / 1e6);
    } catch (e) {
    }
    return {
      effectiveType: "unknown",
      downlink,
      saveData: false,
      latency,
      lastTested: Date.now(),
      isEstimate: true,
      error: downlink === 0 ? "Could not estimate speed" : void 0
    };
  });
}
function getNetworkInfo(forceRefresh = false) {
  return __async(this, null, function* () {
    if (!forceRefresh && cachedInfo && Date.now() - cacheTime < CACHE_TTL) return cachedInfo;
    const conn = getNavigatorConnection();
    if (conn) {
      cachedInfo = buildInfoFromAPI(conn);
      cacheTime = Date.now();
      return cachedInfo;
    }
    cachedInfo = yield estimateSpeedByImage();
    cacheTime = Date.now();
    return cachedInfo;
  });
}

// src/retry.tsx
import React2, {
  lazy,
  useState as useState2,
  useCallback as useCallback2,
  useRef,
  useEffect as useEffect2,
  Suspense,
  createContext,
  useContext
} from "react";

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
  const isServerSide = typeof window === "undefined";
  const isNextJs = !isServerSide && typeof (window == null ? void 0 : window.__NEXT_DATA__) !== "undefined";
  if (isServerSide || isNextJs) {
    return () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          originalImport().then(resolve).catch(reject);
        }, retryCount * 10);
      });
    };
  }
  try {
    const url = new URL(importUrl, window.location.href);
    url.searchParams.append("v", `${retryCount}-${Math.random().toString(36).substring(2)}`);
    return () => import(
      /* @vite-ignore */
      /* webpackIgnore: true */
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
import React, { useState, useEffect, useCallback } from "react";
var defaultLabels = {
  retryLabel: "\u062A\u0644\u0627\u0634 \u0645\u062C\u062F\u062F",
  speedLabel: "\u0633\u0631\u0639\u062A",
  typeLabel: "\u0646\u0648\u0639 \u0627\u062A\u0635\u0627\u0644",
  saveDataLabel: "\u0635\u0631\u0641\u0647\u200C\u062C\u0648\u06CC\u06CC \u062F\u06CC\u062A\u0627",
  saveDataOn: "\u0641\u0639\u0627\u0644",
  saveDataOff: "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644",
  gettingLabel: "\u062F\u0631 \u062D\u0627\u0644 \u062F\u0631\u06CC\u0627\u0641\u062A...",
  percentLabel: (progress) => `${progress}%`,
  messageLabel: ""
};
var Loader = ({
  size = 60,
  borderSize = 6,
  color = "#4f8cff",
  gradient,
  speed = 1.2,
  retries = 0,
  showRetries = true,
  showNetworkInfo = true,
  customStyle = {},
  shadow = "0 0 24px 0 #4f8cff55",
  glow = true,
  animationType = "spinner",
  icon,
  progress,
  message,
  darkMode = false,
  children,
  labels = {}
}) => {
  const mergedLabels = __spreadValues(__spreadValues({}, defaultLabels), labels);
  const [networkInfo, setNetworkInfo] = useState({
    downlink: null,
    effectiveType: "unknown",
    saveData: false
  });
  const updateNetworkInfo = useCallback(() => {
    getNetworkInfo().then((info) => {
      setNetworkInfo((prevInfo) => {
        if (info.downlink !== prevInfo.downlink || info.effectiveType !== prevInfo.effectiveType || info.saveData !== prevInfo.saveData) {
          return info;
        }
        return prevInfo;
      });
    });
  }, []);
  useEffect(() => {
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
  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("loader-keyframes")) {
      const style = document.createElement("style");
      style.id = "loader-keyframes";
      style.innerHTML = `
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes pulse { 0% { opacity: 0.7; transform: scale(1);} 50% { opacity: 0.2; transform: scale(1.15);} 100% { opacity: 0.7; transform: scale(1);} }
        @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0);} 40% { transform: scale(1);} }
        @keyframes wave { 0%, 40%, 100% { transform: scaleY(0.4);} 20% { transform: scaleY(1.0);} }
        @keyframes bar { 0% { left: -40%; } 100% { left: 100%; } }
      `;
      document.head.appendChild(style);
    }
  }, []);
  const spinnerBorder = gradient ? `conic-gradient(${gradient.join(", ")})` : void 0;
  const renderSpinner = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size,
        height: size,
        border: `${borderSize}px solid #e0e7ff`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: "50%",
        boxShadow: shadow,
        animation: `spin ${speed}s cubic-bezier(.68,-0.55,.27,1.55) infinite`,
        position: "relative",
        background: spinnerBorder
      }, glow ? { filter: `drop-shadow(0 0 12px ${color}99)` } : {})
    },
    typeof progress === "number" && /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: size,
        height: size,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          transform: "rotate(-90deg)",
          pointerEvents: "none"
        }
      },
      /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r: (size - borderSize) / 2.2,
          fill: "none",
          stroke: color,
          strokeWidth: borderSize,
          strokeDasharray: 2 * Math.PI * ((size - borderSize) / 2.2),
          strokeDashoffset: 2 * Math.PI * ((size - borderSize) / 2.2) * (1 - progress / 100),
          style: { transition: "stroke-dashoffset 0.4s" }
        }
      )
    )
  );
  const renderDots = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: size * 0.12 } }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: {
        width: size * 0.22,
        height: size * 0.22,
        borderRadius: "50%",
        background: gradient ? `linear-gradient(135deg, ${gradient.join(", ")})` : color,
        animation: `dot-bounce 1.4s infinite both`,
        animationDelay: `${i * 0.16}s`,
        boxShadow: glow ? `0 0 8px ${color}99` : void 0
      }
    }
  )));
  const renderWave = () => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "end", gap: size * 0.08, height: size * 0.5 } }, [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: {
        width: size * 0.12,
        height: size * 0.5,
        background: gradient ? `linear-gradient(135deg, ${gradient.join(", ")})` : color,
        borderRadius: 6,
        animation: `wave 1.2s infinite ease-in-out`,
        animationDelay: `${i * 0.1}s`,
        boxShadow: glow ? `0 0 8px ${color}99` : void 0
      }
    }
  )));
  const renderBar = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        width: size * 1.2,
        height: borderSize * 2.2,
        background: "#e0e7ff",
        borderRadius: borderSize,
        overflow: "hidden",
        position: "relative"
      }
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          height: "100%",
          width: "40%",
          background: gradient ? `linear-gradient(90deg, ${gradient.join(", ")})` : color,
          borderRadius: borderSize,
          animation: "bar 1.2s infinite linear",
          boxShadow: glow ? `0 0 8px ${color}99` : void 0
        }
      }
    )
  );
  const renderIcon = () => icon && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12, fontSize: size * 0.7 } }, icon);
  const themeStyles = darkMode ? {
    background: "linear-gradient(135deg, #23272f 0%, #2d3748 100%)",
    color: "#e0e7ff"
  } : {};
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues(__spreadValues(__spreadValues({}, styles.loaderContainer), themeStyles), customStyle)
    },
    renderIcon(),
    animationType === "spinner" && renderSpinner(),
    animationType === "dots" && renderDots(),
    animationType === "wave" && renderWave(),
    animationType === "bar" && renderBar(),
    typeof progress === "number" && /* @__PURE__ */ React.createElement("div", { style: styles.progressText }, mergedLabels.percentLabel ? mergedLabels.percentLabel(progress) : `${progress}%`),
    showRetries && /* @__PURE__ */ React.createElement("div", { style: styles.retryText }, mergedLabels.retryLabel, ": ", retries),
    showNetworkInfo && /* @__PURE__ */ React.createElement("div", { style: styles.networkInfo }, /* @__PURE__ */ React.createElement("div", null, mergedLabels.speedLabel, ": ", " ", networkInfo.downlink !== null ? `${networkInfo.downlink} Mbps` : mergedLabels.gettingLabel), /* @__PURE__ */ React.createElement("div", null, mergedLabels.typeLabel, ": ", networkInfo.effectiveType), /* @__PURE__ */ React.createElement("div", null, mergedLabels.saveDataLabel, ": ", networkInfo.saveData ? mergedLabels.saveDataOn : mergedLabels.saveDataOff)),
    message && /* @__PURE__ */ React.createElement("div", { style: styles.message }, message),
    children
  );
};
var styles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    minWidth: "100vw",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999,
    transition: "background 0.3s"
  },
  retryText: {
    marginTop: 18,
    fontSize: "18px",
    color: "#4f8cff",
    fontWeight: 600,
    letterSpacing: 1,
    textShadow: "0 1px 8px #b6ccff"
  },
  networkInfo: {
    marginTop: 8,
    fontSize: "15px",
    color: "#555",
    textAlign: "center",
    background: "#f3f6ffcc",
    borderRadius: 8,
    padding: "8px 16px",
    boxShadow: "0 2px 8px #e0e7ff"
  },
  progressText: {
    marginTop: 10,
    fontSize: "16px",
    color: "#4f8cff",
    fontWeight: 700,
    letterSpacing: 1
  },
  message: {
    marginTop: 14,
    fontSize: "16px",
    color: "#333",
    textAlign: "center",
    fontWeight: 500
  }
};
var LoadingSpinner_default = Loader;

// src/retry.tsx
var defaultLFUCache = new LFUCache(5, 36e5);
var LazyLoaderContext = createContext({});
function useMergedOptions(options) {
  const contextOptions = useContext(LazyLoaderContext);
  return __spreadValues(__spreadValues({}, contextOptions || {}), options || {});
}
function useRetryDynamicImport(importFunction, options = {}) {
  var _a, _b;
  const mergedOptions = useMergedOptions(options);
  const retryConfig = getConfig(mergedOptions.retry);
  const [retryCount, setRetryCount] = useState2(0);
  const [error, setError] = useState2(null);
  const abortRef = useRef(null);
  const circuitBreaker = useRef(new CircuitBreaker(__spreadValues(__spreadValues({}, retryConfig), mergedOptions.circuitBreaker || {})));
  const cache = ((_a = mergedOptions.cache) == null ? void 0 : _a.customCache) || defaultLFUCache;
  const cacheKey = ((_b = mergedOptions.cache) == null ? void 0 : _b.key) ? mergedOptions.cache.key(importFunction) : getRouteComponentUrl(importFunction);
  const loadComponent = useCallback2(() => __async(this, null, function* () {
    var _a2, _b2, _c, _d, _e, _f, _g, _h;
    let hasTimedOut = false;
    const { maxRetryCount, timeoutMs } = retryConfig;
    let effectiveType = "unknown", downlink = 0;
    if ((_a2 = mergedOptions.network) == null ? void 0 : _a2.customNetworkInfo) {
      effectiveType = mergedOptions.network.customNetworkInfo.effectiveType;
      downlink = mergedOptions.network.customNetworkInfo.downlink;
    } else {
      const info = yield getNetworkInfo();
      effectiveType = info.effectiveType;
      downlink = info.downlink;
    }
    let adjustedRetryCount = maxRetryCount;
    let adjustedDelay = retryConfig.initialRetryDelayMs;
    if (((_b2 = mergedOptions.network) == null ? void 0 : _b2.adjustRetry) !== false) {
      if (downlink < 1 || effectiveType.includes("2g")) {
        adjustedRetryCount = maxRetryCount * 2;
        adjustedDelay = retryConfig.initialRetryDelayMs * 2;
      }
    }
    if (typeof ((_c = mergedOptions.retry) == null ? void 0 : _c.customDelayFn) === "function") {
      adjustedDelay = mergedOptions.retry.customDelayFn(retryCount, error);
    }
    if (typeof ((_d = mergedOptions.retry) == null ? void 0 : _d.strategy) === "function") {
      adjustedDelay = mergedOptions.retry.strategy(retryCount, error);
    } else if (((_e = mergedOptions.retry) == null ? void 0 : _e.strategy) === "exponential") {
      adjustedDelay = retryConfig.initialRetryDelayMs * Math.pow(2, retryCount);
    } else if (((_f = mergedOptions.retry) == null ? void 0 : _f.strategy) === "linear") {
      adjustedDelay = retryConfig.initialRetryDelayMs * (retryCount + 1);
    }
    const importUrl = cacheKey;
    const cachedComponent = importUrl ? cache.get(importUrl) : null;
    if (cachedComponent) return Promise.resolve(cachedComponent);
    (_g = abortRef.current) == null ? void 0 : _g.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    if (((_h = mergedOptions.mock) == null ? void 0 : _h.enabled) && mergedOptions.mock.mockImport) {
      return mergedOptions.mock.mockImport();
    }
    let actualImportFunction = importFunction;
    if (mergedOptions.importFrom && mergedOptions.importFrom !== "local") {
    }
    const maxConcurrent = mergedOptions.maxConcurrentLoads || 4;
    return new Promise((resolve, reject) => {
      enqueueLoad(() => {
        const timeoutId = setTimeout(() => {
          hasTimedOut = true;
          dequeueLoad();
          reject(new Error("Component load timed out."));
        }, timeoutMs);
        function tryLoadComponent(currentRetry) {
          if (hasTimedOut || signal.aborted) {
            clearTimeout(timeoutId);
            dequeueLoad();
            reject(new Error("Component load aborted."));
            return;
          }
          const retryImport = getRetryImportFunction(actualImportFunction, currentRetry);
          retryImport().then((module) => {
            var _a3, _b3;
            clearTimeout(timeoutId);
            if (importUrl) cache.set(importUrl, module);
            (_b3 = (_a3 = mergedOptions.retry) == null ? void 0 : _a3.onSuccess) == null ? void 0 : _b3.call(_a3, module);
            dequeueLoad();
            resolve(module);
          }).catch((err) => {
            var _a3, _b3, _c2, _d2, _e2, _f2, _g2, _h2, _i;
            (_b3 = (_a3 = mergedOptions.retry) == null ? void 0 : _a3.onRetry) == null ? void 0 : _b3.call(_a3, currentRetry, err);
            if (circuitBreaker.current.handleFailure()) {
              clearTimeout(timeoutId);
              (_d2 = (_c2 = mergedOptions.retry) == null ? void 0 : _c2.onError) == null ? void 0 : _d2.call(_c2, err);
              dequeueLoad();
              reject(err);
              return;
            }
            if (typeof ((_e2 = mergedOptions.retry) == null ? void 0 : _e2.retryCondition) === "function" && !mergedOptions.retry.retryCondition(err)) {
              clearTimeout(timeoutId);
              (_g2 = (_f2 = mergedOptions.retry) == null ? void 0 : _f2.onError) == null ? void 0 : _g2.call(_f2, err);
              dequeueLoad();
              reject(err);
              return;
            }
            if (currentRetry < adjustedRetryCount) {
              setTimeout(() => tryLoadComponent(currentRetry + 1), (currentRetry + 1) * adjustedDelay);
            } else {
              clearTimeout(timeoutId);
              (_i = (_h2 = mergedOptions.retry) == null ? void 0 : _h2.onError) == null ? void 0 : _i.call(_h2, err);
              dequeueLoad();
              reject(err);
            }
          });
        }
        tryLoadComponent(0);
      }, maxConcurrent);
    });
  }), [importFunction, retryConfig, mergedOptions, retryCount, error]);
  const [Component, setComponent] = useState2(() => lazy(loadComponent));
  const reset = useCallback2(() => {
    setRetryCount(0);
    setError(null);
    setComponent(() => lazy(loadComponent));
  }, [loadComponent]);
  const LazyWithErrorBoundary = React2.useMemo(() => {
    return React2.lazy(
      () => loadComponent().then((mod) => {
        setError(null);
        return mod;
      }).catch((err) => {
        setRetryCount((c) => c + 1);
        setError(err);
        throw err;
      })
    );
  }, [loadComponent]);
  useEffect2(() => {
    return () => {
      var _a2;
      (_a2 = abortRef.current) == null ? void 0 : _a2.abort();
    };
  }, []);
  return { Component: LazyWithErrorBoundary, retryCount, error, reset };
}
var LoaderThemeContext = createContext("light");
function useLoaderTheme(theme) {
  const contextTheme = useContext(LoaderThemeContext);
  return theme || contextTheme || "light";
}
var LoaderAnimationRegistryContext = createContext({});
function useLoaderAnimation(animationKey, customAnimation) {
  const registry = useContext(LoaderAnimationRegistryContext);
  if (customAnimation) return customAnimation;
  if (animationKey && registry[animationKey]) return registry[animationKey];
  return void 0;
}
var LazyLoader = (_a) => {
  var _b = _a, {
    importFunction,
    options = {},
    fallback
  } = _b, rest = __objRest(_b, [
    "importFunction",
    "options",
    "fallback"
  ]);
  var _a2, _b2, _c, _d, _e, _f;
  const mergedOptions = useMergedOptions(options);
  const { Component, retryCount, error, reset } = useRetryDynamicImport(importFunction, mergedOptions);
  const loaderConfig = mergedOptions.loader || {};
  const theme = useLoaderTheme(loaderConfig.theme);
  const AnimationComponent = useLoaderAnimation(loaderConfig.animationKey, loaderConfig.customAnimation);
  const loaderProps = {
    retries: retryCount,
    size: loaderConfig.size,
    borderSize: loaderConfig.borderSize,
    color: loaderConfig.color,
    speed: loaderConfig.speed,
    showRetries: loaderConfig.showRetries,
    showNetworkInfo: loaderConfig.showNetworkInfo,
    customStyle: loaderConfig.customStyle,
    animation: loaderConfig.animation,
    theme,
    message: loaderConfig.loadingMessage,
    "aria-label": loaderConfig.a11yLabel,
    role: loaderConfig.a11yRole || "status"
  };
  const [showSpinner, setShowSpinner] = useState2(!((_a2 = loaderConfig.multiStage) == null ? void 0 : _a2.skeleton));
  useEffect2(() => {
    var _a3, _b3;
    if (((_a3 = loaderConfig.multiStage) == null ? void 0 : _a3.skeleton) && loaderConfig.multiStage.delay) {
      setShowSpinner(false);
      const timer = setTimeout(() => setShowSpinner(true), loaderConfig.multiStage.delay);
      return () => clearTimeout(timer);
    } else if ((_b3 = loaderConfig.multiStage) == null ? void 0 : _b3.skeleton) {
      setShowSpinner(false);
      setTimeout(() => setShowSpinner(true), 300);
    }
  }, [loaderConfig.multiStage]);
  if (typeof window === "undefined") {
    if (loaderConfig.fallbackStrategy === "static" && loaderConfig.progressiveFallback) {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.progressiveFallback);
    }
    const ssrFallback = (_b2 = mergedOptions.ssr) == null ? void 0 : _b2.fallback;
    if (ssrFallback !== void 0 && ssrFallback !== null) {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, ssrFallback);
    }
    return null;
  }
  if (error) {
    if (typeof loaderConfig.errorFallback === "function") {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.errorFallback(error, reset));
    }
    if (typeof loaderConfig.fallbackStrategy === "function") {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.fallbackStrategy(error));
    }
    if (loaderConfig.fallbackStrategy === "static" && loaderConfig.progressiveFallback) {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.progressiveFallback);
    }
    if (loaderConfig.fallbackStrategy === "simple") {
      let msg = "Failed to load.";
      if (typeof loaderConfig.errorMessage === "function") {
        msg = loaderConfig.errorMessage(error);
      } else if (typeof loaderConfig.errorMessage === "string") {
        msg = loaderConfig.errorMessage;
      }
      return /* @__PURE__ */ React2.createElement("div", null, msg);
    }
    if (loaderConfig.fallbackStrategy === "none") {
      return null;
    }
    return loaderConfig.fallback ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.fallback) : /* @__PURE__ */ React2.createElement("div", { style: { textAlign: "center", padding: 24 }, role: "alert", "aria-live": "assertive" }, /* @__PURE__ */ React2.createElement("div", { style: { color: loaderConfig.errorColor || "red", marginBottom: 8 } }, loaderConfig.errorMessage ? typeof loaderConfig.errorMessage === "function" ? loaderConfig.errorMessage(error) : loaderConfig.errorMessage : `Error loading component: ${error.message}`), /* @__PURE__ */ React2.createElement(
      "button",
      {
        onClick: reset,
        style: loaderConfig.retryButtonStyle || { padding: "8px 16px", borderRadius: 4, cursor: "pointer" },
        "aria-label": loaderConfig.retryButtonText || "Retry"
      },
      loaderConfig.retryButtonText || "Retry"
    ));
  }
  if (mergedOptions.suspense === false) {
    if (((_c = loaderConfig.multiStage) == null ? void 0 : _c.skeleton) && !showSpinner) {
      return /* @__PURE__ */ React2.createElement(React2.Fragment, null, loaderConfig.multiStage.skeleton);
    }
    if (AnimationComponent) return /* @__PURE__ */ React2.createElement(AnimationComponent, __spreadValues({}, loaderProps));
    return /* @__PURE__ */ React2.createElement(React2.Fragment, null, (_e = (_d = loaderConfig.customLoader) != null ? _d : fallback) != null ? _e : /* @__PURE__ */ React2.createElement(LoadingSpinner_default, __spreadValues({}, loaderProps)));
  }
  useEffect2(() => {
    var _a3;
    if (((_a3 = mergedOptions.log) == null ? void 0 : _a3.enabled) && mergedOptions.log.telemetryHook) {
      mergedOptions.log.telemetryHook({ type: "mount", timestamp: Date.now() });
    }
    return () => {
      var _a4;
      if (((_a4 = mergedOptions.log) == null ? void 0 : _a4.enabled) && mergedOptions.log.telemetryHook) {
        mergedOptions.log.telemetryHook({ type: "unmount", timestamp: Date.now() });
      }
    };
  }, []);
  return /* @__PURE__ */ React2.createElement(Suspense, { fallback: ((_f = loaderConfig.multiStage) == null ? void 0 : _f.skeleton) && !showSpinner ? loaderConfig.multiStage.skeleton : AnimationComponent ? /* @__PURE__ */ React2.createElement(AnimationComponent, __spreadValues({}, loaderProps)) : fallback || loaderConfig.customLoader || /* @__PURE__ */ React2.createElement(LoadingSpinner_default, __spreadValues({}, loaderProps)) }, /* @__PURE__ */ React2.createElement(Component, __spreadValues({}, rest)));
};
function retryDynamicImport(importFunction, options) {
  return (props) => /* @__PURE__ */ React2.createElement(
    LazyLoader,
    __spreadValues({
      importFunction,
      options
    }, props)
  );
}
var prefetchDynamicImport = (importFunction, options) => {
  var _a, _b;
  if (!(options == null ? void 0 : options.strategy) || options.strategy === "eager") {
    const retryImport = getRetryImportFunction(importFunction, 0);
    retryImport().then((module) => {
      var _a2, _b2, _c;
      (_a2 = options == null ? void 0 : options.onSuccess) == null ? void 0 : _a2.call(options);
      if (((_b2 = options == null ? void 0 : options.cache) == null ? void 0 : _b2.enabled) && ((_c = options == null ? void 0 : options.cache) == null ? void 0 : _c.key)) {
        defaultLFUCache.set(options.cache.key, module);
      }
    }).catch((error) => {
      var _a2;
      (_a2 = options == null ? void 0 : options.onError) == null ? void 0 : _a2.call(options, error);
    });
    return;
  }
  if (options.strategy === "idle" && typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => prefetchDynamicImport(importFunction, __spreadProps(__spreadValues({}, options), { strategy: "eager" })));
    return;
  }
  if (options.strategy === "on-hover" && ((_a = options.elementRef) == null ? void 0 : _a.current)) {
    const el = options.elementRef.current;
    const handler = () => prefetchDynamicImport(importFunction, __spreadProps(__spreadValues({}, options), { strategy: "eager" }));
    el.addEventListener("mouseenter", handler, { once: true });
    return;
  }
  if (options.strategy === "on-visible" && ((_b = options.elementRef) == null ? void 0 : _b.current) && typeof window !== "undefined") {
    const el = options.elementRef.current;
    const observer = new window.IntersectionObserver((entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        prefetchDynamicImport(importFunction, __spreadProps(__spreadValues({}, options), { strategy: "eager" }));
        obs.disconnect();
      }
    });
    observer.observe(el);
    return;
  }
};
var priorityLoadComponent = (importFunction, options) => {
  var _a;
  const delay = (_a = options == null ? void 0 : options.delay) != null ? _a : (options == null ? void 0 : options.priority) ? options.priority * 1e3 : 0;
  setTimeout(() => {
    var _a2;
    retryDynamicImport(importFunction);
    (_a2 = options == null ? void 0 : options.onLoad) == null ? void 0 : _a2.call(options);
  }, delay);
};
var loadQueue = [];
var currentLoads = 0;
function enqueueLoad(fn, maxConcurrent) {
  if (currentLoads < maxConcurrent) {
    currentLoads++;
    fn();
  } else {
    loadQueue.push(fn);
  }
}
function dequeueLoad() {
  currentLoads = Math.max(0, currentLoads - 1);
  if (loadQueue.length > 0) {
    const next = loadQueue.shift();
    if (next) {
      currentLoads++;
      next();
    }
  }
}
export {
  LazyLoader,
  prefetchDynamicImport,
  priorityLoadComponent,
  retryDynamicImport
};
