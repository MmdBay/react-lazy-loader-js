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
  try {
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
  } catch (error) {
    return {
      effectiveType: "unknown",
      downlink: 0,
      saveData: false,
      lastTested: Date.now(),
      isEstimate: true,
      error: "Property access error"
    };
  }
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
import React3, {
  lazy,
  useState as useState2,
  useCallback as useCallback3,
  useRef as useRef2,
  useEffect as useEffect2,
  useMemo,
  Suspense,
  createContext,
  useContext
} from "react";

// src/config.ts
var defaultConfig = {
  circuitBreakerThreshold: 5,
  // After 5 failures, stop trying and take a break
  resetTimeMs: 3e4,
  // Wait 30 seconds before trying again after circuit breaker opens
  maxRetryCount: 15,
  // Try up to 15 times before giving up
  initialRetryDelayMs: 500,
  // Wait 500ms before first retry
  maxRetryDelayMs: 5e3,
  // Maximum wait time between retries is 5 seconds
  timeoutMs: 3e4
  // Timeout after 30 seconds
};
function getConfig(overrides) {
  return __spreadValues(__spreadValues({}, defaultConfig), overrides);
}

// src/MinHeap.ts
var MinHeap = class {
  // Maps keys to their positions in the heap
  /**
   * Initialize an empty MinHeap with empty heap array and position tracking map.
   */
  constructor() {
    this.heap = [];
    this.positions = /* @__PURE__ */ new Map();
  }
  /**
   * Add a new key with its frequency to the heap.
   * Places the item at the end and bubbles up to maintain heap property.
   */
  push(key, frequency) {
    const node = { key, frequency, index: this.heap.length };
    this.heap.push(node);
    this.positions.set(key, node.index);
    this.bubbleUp(this.heap.length - 1);
  }
  /**
   * Remove and return the key with the lowest frequency (root of the heap).
   * Swaps root with last item, removes it, and bubbles down to restore heap property.
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
   * Remove a specific key from the heap.
   * Swaps with last item, removes it, and rebalances the heap.
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
   * Update the frequency of a key and rebalance the heap.
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
   * Move a node up the heap until heap property is satisfied.
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
   * Move a node down the heap until heap property is satisfied.
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
   * Swap two items in the heap and update their position tracking.
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
   * Get the parent index of a node at the given index.
   */
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }
  /**
   * Get the left child index of a node at the given index.
   */
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }
  /**
   * Get the right child index of a node at the given index.
   */
  getRightChildIndex(index) {
    return 2 * index + 2;
  }
  /**
   * Check if the heap is empty.
   */
  isEmpty() {
    return this.heap.length === 0;
  }
};

// src/cache.ts
var LFUCache = class {
  // Tracks frequency for efficient LFU eviction
  constructor(capacity, ttl) {
    this.capacity = capacity;
    this.ttl = ttl;
    this.cache = /* @__PURE__ */ new Map();
    this.heap = new MinHeap();
  }
  /**
   * Retrieve an item from the cache. Updates frequency on access and removes expired items.
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
   * Add or update an item in the cache. Evicts least frequently used item if at capacity.
   */
  set(key, value) {
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
  // Wait time before transitioning to half-open state
  constructor(config) {
    // Track the number of failed retries and circuit state
    this.retryCount = 0;
    this.isOpen = false;
    // True when circuit is open (no attempts allowed)
    this.isHalfOpen = false;
    this.failureThreshold = config.circuitBreakerThreshold;
    this.resetTimeout = config.resetTimeMs;
    this.successThreshold = 2;
  }
  /**
   * Handle failure events and determine if the circuit should be opened.
   * If the failure threshold is exceeded, the circuit opens to prevent further attempts.
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
   * Handle successful attempts. In half-open state, successful attempts move us closer
   * to closing the circuit and returning to normal operation.
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
   * Open the circuit breaker after too many failures.
   * Sets a timeout to transition to half-open state for testing recovery.
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
   * Close the circuit breaker when service has recovered.
   * Returns to normal operational state.
   */
  closeCircuit() {
    this.isHalfOpen = false;
    this.isOpen = false;
    this.retryCount = 0;
    console.log("Circuit breaker is now fully closed and operational.");
  }
  /**
   * Check if the circuit breaker is currently open (blocking attempts).
   */
  isCircuitOpen() {
    return this.isOpen;
  }
};

// src/LoadingSpinner.tsx
import React, { useState, useEffect, useCallback } from "react";
var defaultLabels = {
  retryLabel: "Retry",
  speedLabel: "Network Speed",
  typeLabel: "Connection",
  saveDataLabel: "Data Saver",
  saveDataOn: "On",
  saveDataOff: "Off",
  gettingLabel: "Calculating...",
  percentLabel: (progress) => `${progress}%`,
  messageLabel: "",
  loadingLabel: "Loading",
  completedLabel: "Completed",
  errorLabel: "Error"
};
var Loader = ({
  size = 80,
  borderSize = 6,
  color = "#6366f1",
  secondaryColor = "#e0e7ff",
  accentColor = "#8b5cf6",
  gradient,
  speed = 1.2,
  retries = 0,
  showRetries = true,
  showNetworkInfo = true,
  disableNetworkInfo = false,
  customStyle = {},
  shadow = "0 0 32px 0 rgba(99, 102, 241, 0.3)",
  glow = true,
  glowIntensity = 0.6,
  animationType = "spin",
  icon,
  progress,
  message,
  darkMode = false,
  children,
  labels = {},
  blurBackground = true,
  backdrop = true,
  backdropOpacity = 0.7,
  font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  rounded = true,
  floatingStyle = true,
  pulseEffect = false,
  // New advanced options with defaults
  glassmorphism = false,
  neumorphism = false,
  vibrantColors = false,
  smoothTransitions = true,
  microInteractions = true,
  particleCount = 6,
  showLoadingText = true,
  showPercentage = true,
  audioFeedback = false,
  hapticFeedback = false,
  customTheme = "modern",
  autoHideDelay = 0,
  fadeInDuration = 800,
  scaleEffect = true,
  rotationIntensity = 1,
  colorShift = false,
  breathingEffect = false,
  magneticEffect = false,
  hoverEffects = true,
  accessibility = true,
  reducedMotion = false,
  highContrast = false
}) => {
  const mergedLabels = __spreadValues(__spreadValues({}, defaultLabels), labels);
  const [networkInfo, setNetworkInfo] = useState({
    downlink: null,
    effectiveType: "unknown",
    saveData: false
  });
  const [isVisible, setIsVisible] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("loading");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const updateNetworkInfo = useCallback(() => {
    let isMounted = true;
    getNetworkInfo().then((info) => {
      if (isMounted) {
        setNetworkInfo((prevInfo) => {
          if (info.downlink !== prevInfo.downlink || info.effectiveType !== prevInfo.effectiveType || info.saveData !== prevInfo.saveData) {
            return info;
          }
          return prevInfo;
        });
      }
    }).catch(() => {
    });
    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setLoadingPhase("completing");
        setTimeout(() => setLoadingPhase("completed"), 500);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHideDelay]);
  useEffect(() => {
    if (typeof progress === "number") {
      if (progress >= 100) {
        setLoadingPhase("completing");
        setTimeout(() => setLoadingPhase("completed"), 800);
      } else if (progress >= 95) {
        setLoadingPhase("completing");
      } else {
        setLoadingPhase("loading");
      }
    }
  }, [progress]);
  useEffect(() => {
    if (magneticEffect) {
      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [magneticEffect]);
  useEffect(() => {
    if (disableNetworkInfo) return;
    if (typeof window !== "undefined" && window.__JEST__) return;
    const cleanup = updateNetworkInfo();
    const connection = navigator.connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener("change", updateNetworkInfo);
    }
    return () => {
      if (cleanup) cleanup();
      if (connection && connection.removeEventListener) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo, disableNetworkInfo]);
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    let style = document.getElementById("advanced-loader-keyframes");
    if (!style) {
      style = document.createElement("style");
      style.id = "advanced-loader-keyframes";
      document.head.appendChild(style);
    }
    style.innerHTML = `
      @keyframes spin { 
        from { transform: rotate(0deg); } 
        to { transform: rotate(360deg); } 
      }
      @keyframes pulse { 
        0% { opacity: 0.4; transform: scale(0.95); } 
        50% { opacity: 1; transform: scale(1.05); } 
        100% { opacity: 0.4; transform: scale(0.95); } 
      }
      @keyframes dot-bounce { 
        0%, 80%, 100% { transform: scale(0) translateY(0); } 
        40% { transform: scale(1) translateY(-10px); } 
      }
      @keyframes wave { 
        0%, 40%, 100% { transform: scaleY(0.4); } 
        20% { transform: scaleY(1.0); } 
      }
      @keyframes bar { 
        0% { left: -35%; } 
        100% { left: 100%; } 
      }
      @keyframes ripple {
        0% { 
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      @keyframes square {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(90deg); }
        50% { transform: rotate(180deg); }
        75% { transform: rotate(270deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes infinity {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes cube {
        0%, 70%, 100% { transform: scale(1); }
        35% { transform: scale(1.2); }
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      @keyframes spiral {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes orbit {
        0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-20px); }
        60% { transform: translateY(-10px); }
      }
      @keyframes morph {
        0% { border-radius: 50%; transform: rotate(0deg); }
        25% { border-radius: 0%; transform: rotate(90deg); }
        50% { border-radius: 50%; transform: rotate(180deg); }
        75% { border-radius: 0%; transform: rotate(270deg); }
        100% { border-radius: 50%; transform: rotate(360deg); }
      }
      @keyframes gradient-spin {
        0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
        100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
      }
      @keyframes elastic {
        0% { transform: scale(1) rotateZ(0deg); }
        50% { transform: scale(1.25) rotateZ(180deg); }
        100% { transform: scale(1) rotateZ(360deg); }
      }
      @keyframes flip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(180deg); }
        100% { transform: rotateY(360deg); }
      }
      @keyframes scale {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.2); }
        100% { transform: scale(0.8); }
      }
      @keyframes particles {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-50px) rotate(360deg); opacity: 0; }
      }
      @keyframes neon {
        0% { 
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
        }
        50% { 
          box-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; 
          text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; 
        }
        100% { 
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
        }
      }
      @keyframes breathe {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: scale(0.9) translateY(20px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes slideIn {
        0% { transform: translateY(100px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      @keyframes colorShift {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
  }, []);
  const themes = {
    modern: {
      background: darkMode ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)",
      card: darkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(248, 250, 252, 0.9)",
      text: darkMode ? "#f1f5f9" : "#0f172a",
      textSecondary: darkMode ? "#94a3b8" : "#64748b",
      highlight: color,
      shadow: darkMode ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
      border: darkMode ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.3)"
    },
    glass: {
      background: darkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.1)",
      card: darkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
      text: darkMode ? "#ffffff" : "#000000",
      textSecondary: darkMode ? "#cbd5e1" : "#475569",
      highlight: color,
      shadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      border: "rgba(255, 255, 255, 0.18)"
    },
    neon: {
      background: "rgba(0, 0, 0, 0.9)",
      card: "rgba(20, 20, 20, 0.8)",
      text: "#00ffff",
      textSecondary: "#ff00ff",
      highlight: "#00ff00",
      shadow: "0 0 50px rgba(0, 255, 255, 0.5)",
      border: "rgba(0, 255, 255, 0.3)"
    },
    minimal: {
      background: darkMode ? "#000000" : "#ffffff",
      card: darkMode ? "#111111" : "#f9f9f9",
      text: darkMode ? "#ffffff" : "#000000",
      textSecondary: darkMode ? "#888888" : "#666666",
      highlight: color,
      shadow: "none",
      border: darkMode ? "#333333" : "#eeeeee"
    },
    gradient: {
      background: `linear-gradient(135deg, ${darkMode ? "#667eea 0%, #764ba2 100%" : "#f093fb 0%, #f5576c 100%"})`,
      card: "rgba(255, 255, 255, 0.1)",
      text: "#ffffff",
      textSecondary: "#f0f0f0",
      highlight: "#ffffff",
      shadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
      border: "rgba(255, 255, 255, 0.2)"
    },
    classic: {
      background: darkMode ? "#2d3748" : "#f7fafc",
      card: darkMode ? "#4a5568" : "#ffffff",
      text: darkMode ? "#e2e8f0" : "#2d3748",
      textSecondary: darkMode ? "#a0aec0" : "#718096",
      highlight: color,
      shadow: darkMode ? "0 10px 25px rgba(0, 0, 0, 0.3)" : "0 10px 25px rgba(0, 0, 0, 0.1)",
      border: darkMode ? "#718096" : "#e2e8f0"
    }
  };
  const currentTheme = themes[customTheme] || themes.modern;
  const enhancedGradient = gradient || (vibrantColors ? [
    "#ff0099",
    "#00ff99",
    "#9900ff",
    "#ff9900",
    "#0099ff"
  ] : [color, accentColor]);
  const spinnerBorder = enhancedGradient.length > 1 ? `conic-gradient(${enhancedGradient.join(", ")})` : void 0;
  const floatingAnimation = floatingStyle ? {
    animation: `float 3s ease-in-out infinite${breathingEffect ? ", breathe 2s ease-in-out infinite" : ""}`
  } : {};
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "99, 102, 241";
  }
  const renderSpinner = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues(__spreadValues({
        width: size,
        height: size,
        border: `${borderSize}px solid ${secondaryColor}`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: "50%",
        animation: `spin ${speed}s linear infinite${colorShift ? ", colorShift 4s linear infinite" : ""}`,
        position: "relative",
        display: "inline-block",
        background: "transparent"
      }, glow ? {
        boxShadow: `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity}), inset 0 0 ${Math.round(size / 8)}px rgba(${hexToRgb(color)}, ${glowIntensity / 2})`
      } : {}), floatingAnimation)
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
          stroke: accentColor,
          strokeWidth: borderSize,
          strokeDasharray: 2 * Math.PI * ((size - borderSize) / 2.2),
          strokeDashoffset: 2 * Math.PI * ((size - borderSize) / 2.2) * (1 - progress / 100),
          style: {
            transition: smoothTransitions ? "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            filter: glow ? `drop-shadow(0 0 8px ${accentColor})` : void 0
          }
        }
      )
    )
  );
  const renderGradientSpin = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadProps(__spreadValues(__spreadValues({
        width: size,
        height: size,
        background: `conic-gradient(from 0deg, ${enhancedGradient.join(", ")}, ${enhancedGradient[0]})`,
        borderRadius: "50%",
        animation: `spin ${speed}s linear infinite`,
        position: "relative",
        display: "inline-block"
      }, floatingAnimation), glow ? {
        boxShadow: `0 0 ${size / 2}px rgba(${hexToRgb(color)}, ${glowIntensity})`
      } : {}), {
        padding: borderSize
      })
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          width: `${size - borderSize * 2}px`,
          height: `${size - borderSize * 2}px`,
          borderRadius: "50%",
          background: currentTheme.card,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      typeof progress === "number" && /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            fontSize: size * 0.2,
            fontWeight: "bold",
            color: currentTheme.text
          }
        },
        progress,
        "%"
      )
    )
  );
  const renderDots = () => /* @__PURE__ */ React.createElement("div", { style: __spreadValues({
    display: "flex",
    gap: size * 0.15,
    alignItems: "center",
    justifyContent: "center"
  }, floatingAnimation) }, Array.from({ length: Math.min(particleCount, 5) }, (_, i) => {
    const dotColor = enhancedGradient.length > 1 ? enhancedGradient[i % enhancedGradient.length] : color;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        style: {
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: "50%",
          backgroundColor: dotColor,
          animation: `dot-bounce ${1.4}s infinite both`,
          animationDelay: `${i * 0.16}s`,
          boxShadow: glow ? `0 0 ${Math.round(size / 6)}px rgba(${hexToRgb(dotColor)}, ${glowIntensity})` : void 0
        }
      }
    );
  }));
  const renderWave = () => /* @__PURE__ */ React.createElement("div", { style: __spreadValues({
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: size * 0.08,
    height: size * 0.8
  }, floatingAnimation) }, Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: {
        width: size * 0.12,
        height: size * 0.8,
        backgroundColor: enhancedGradient.length > 1 ? enhancedGradient[i % enhancedGradient.length] : color,
        borderRadius: rounded ? `${size * 0.06}px` : "2px",
        animation: `wave ${1.2}s infinite ease-in-out`,
        animationDelay: `${i * 0.1}s`,
        boxShadow: glow ? `0 0 ${Math.round(size / 6)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        transformOrigin: "bottom"
      }
    }
  )));
  const renderParticles = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        position: "relative",
        width: size,
        height: size,
        display: "inline-block"
      }, floatingAnimation)
    },
    Array.from({ length: Math.min(particleCount, 4) }, (_, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        style: {
          position: "absolute",
          width: size * 0.08,
          height: size * 0.08,
          borderRadius: "50%",
          backgroundColor: enhancedGradient[i % enhancedGradient.length] || color,
          left: `${25 + i * 12}%`,
          top: `${25 + i * 12}%`,
          animation: `particles ${2 + i * 0.3}s infinite linear`,
          animationDelay: `${i * 0.4}s`,
          boxShadow: glow ? `0 0 ${size * 0.03}px currentColor` : void 0
        }
      }
    )),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: "50%",
          backgroundColor: color,
          animation: "pulse 2s ease-in-out infinite",
          boxShadow: glow ? `0 0 ${size * 0.15}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
        }
      }
    )
  );
  const renderSpiral = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size,
        height: size,
        border: `${borderSize}px solid transparent`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRight: `${borderSize}px solid ${accentColor}`,
        borderRadius: "50%",
        animation: `spin ${speed}s linear infinite`,
        boxShadow: glow ? `0 0 ${size / 3}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderOrbit = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        position: "relative",
        width: size,
        height: size,
        display: "inline-block"
      }, floatingAnimation)
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size * 0.3,
          height: size * 0.3,
          marginTop: -size * 0.15,
          marginLeft: -size * 0.15,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: glow ? `0 0 ${size * 0.15}px ${color}` : void 0
        }
      }
    ),
    Array.from({ length: 2 }, (_, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size * 0.12,
          height: size * 0.12,
          marginTop: -size * 0.06,
          marginLeft: -size * 0.06,
          borderRadius: "50%",
          backgroundColor: enhancedGradient[i] || accentColor,
          animation: `orbit ${2 + i}s linear infinite`,
          animationDelay: `${i * 1}s`,
          boxShadow: glow ? `0 0 ${size * 0.08}px currentColor` : void 0
        }
      }
    ))
  );
  const renderPulse = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        animation: "pulse 1.5s infinite ease-in-out",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderRipple = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        position: "relative",
        width: size,
        height: size,
        display: "inline-block"
      }, floatingAnimation)
    },
    [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: i,
        style: {
          position: "absolute",
          border: `${borderSize}px solid ${color}`,
          opacity: 1,
          borderRadius: "50%",
          animation: `ripple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
          animationDelay: `${i * 0.6}s`,
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          boxShadow: glow ? `0 0 ${Math.round(size / 5)}px rgba(${hexToRgb(color)}, ${glowIntensity / 2})` : void 0
        }
      }
    )),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
        }
      }
    )
  );
  const renderSquare = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: color,
        animation: "square 2s ease infinite",
        boxShadow: glow ? `0 0 ${Math.round(size / 5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderInfinity = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 1.2,
        height: size * 0.6,
        position: "relative",
        display: "inline-block"
      }, floatingAnimation)
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: size * 0.6,
          height: size * 0.6,
          border: `${borderSize}px solid ${color}`,
          borderRadius: "50%",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          animation: "infinity 1.2s linear infinite",
          boxShadow: glow ? `0 0 ${Math.round(size / 5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
        }
      }
    ),
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          right: 0,
          width: size * 0.6,
          height: size * 0.6,
          border: `${borderSize}px solid ${color}`,
          borderRadius: "50%",
          borderLeftColor: "transparent",
          borderTopColor: "transparent",
          animation: "infinity 1.2s linear infinite",
          boxShadow: glow ? `0 0 ${Math.round(size / 5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
        }
      }
    )
  );
  const renderCube = () => /* @__PURE__ */ React.createElement("div", { style: __spreadValues({
    width: size,
    height: size,
    display: "inline-block"
  }, floatingAnimation) }, /* @__PURE__ */ React.createElement("div", { style: {
    width: size * 0.8,
    height: size * 0.8,
    backgroundColor: color,
    animation: "square 2s infinite ease-in-out",
    margin: size * 0.1,
    boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
  } }));
  const renderBar = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 1.5,
        height: borderSize * 3,
        backgroundColor: secondaryColor,
        borderRadius: rounded ? borderSize : 0,
        overflow: "hidden",
        position: "relative",
        display: "inline-block"
      }, floatingAnimation)
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          height: "100%",
          width: "40%",
          background: enhancedGradient.length > 1 ? `linear-gradient(90deg, ${enhancedGradient.join(", ")})` : color,
          borderRadius: rounded ? borderSize : 0,
          animation: "bar 1.2s infinite linear",
          boxShadow: glow ? `0 0 ${Math.round(size / 6)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0
        }
      }
    )
  );
  const renderBounce = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: "50%",
        backgroundColor: color,
        animation: "bounce 2s infinite",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderMorph = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: color,
        animation: "morph 3s infinite ease-in-out",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderElastic = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: "50%",
        backgroundColor: color,
        animation: "elastic 2s infinite ease-in-out",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderFlip = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: rounded ? "20%" : "8px",
        backgroundColor: color,
        animation: "flip 2s infinite ease-in-out",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderScale = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: "50%",
        backgroundColor: color,
        animation: "scale 1.5s infinite ease-in-out",
        boxShadow: glow ? `0 0 ${Math.round(size / 4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
        display: "inline-block"
      }, floatingAnimation)
    }
  );
  const renderNeon = () => /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadValues({
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${borderSize}px solid ${color}`,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        animation: `spin ${speed}s linear infinite, neon 2s ease-in-out infinite alternate`,
        display: "inline-block",
        position: "relative"
      }, floatingAnimation)
    },
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color,
          fontSize: size * 0.3,
          fontWeight: "bold",
          animation: "neon 2s ease-in-out infinite alternate"
        }
      },
      "\u26A1"
    )
  );
  const validAnimations = [
    "spin",
    "dots",
    "wave",
    "bar",
    "pulse",
    "ripple",
    "square",
    "infinity",
    "cube",
    "spiral",
    "orbit",
    "bounce",
    "morph",
    "gradient-spin",
    "elastic",
    "flip",
    "scale",
    "particles",
    "neon"
  ];
  const safeAnimationType = validAnimations.includes(animationType) ? animationType : "spin";
  const renderLoader = () => {
    const loaderProps = {
      style: __spreadValues({
        transition: smoothTransitions ? "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" : void 0
      }, reducedMotion ? { animationDuration: "3s" } : {})
    };
    switch (safeAnimationType) {
      case "dots":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderDots());
      case "wave":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderWave());
      case "particles":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderParticles());
      case "spiral":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderSpiral());
      case "orbit":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderOrbit());
      case "gradient-spin":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderGradientSpin());
      case "pulse":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderPulse());
      case "ripple":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderRipple());
      case "square":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderSquare());
      case "infinity":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderInfinity());
      case "cube":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderCube());
      case "bar":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderBar());
      case "bounce":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderBounce());
      case "morph":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderMorph());
      case "elastic":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderElastic());
      case "flip":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderFlip());
      case "scale":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderScale());
      case "neon":
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderNeon());
      case "spin":
      default:
        return /* @__PURE__ */ React.createElement("div", __spreadValues({}, loaderProps), renderSpinner());
    }
  };
  const renderIcon = () => icon && /* @__PURE__ */ React.createElement("div", { style: __spreadProps(__spreadValues({
    marginBottom: 16,
    fontSize: size * 0.8,
    color: currentTheme.highlight,
    filter: glow ? `drop-shadow(0 0 ${Math.round(size / 12)}px rgba(${hexToRgb(color)}, ${glowIntensity}))` : void 0
  }, floatingAnimation), {
    animation: `${floatingAnimation.animation || ""} ${animationType === "neon" ? ", neon 2s ease-in-out infinite alternate" : ""}`
  }) }, icon);
  const backdropStyle = backdrop ? __spreadProps(__spreadValues({
    backgroundColor: customTheme === "gradient" ? "transparent" : darkMode ? `#181f2a` : `#f4f6fa`
  }, blurBackground && (glassmorphism || customTheme === "glass") ? {
    backdropFilter: "blur(16px) saturate(180%)"
  } : {}), {
    background: customTheme === "gradient" ? currentTheme.background : void 0
  }) : {};
  const glassEffect = glassmorphism || customTheme === "glass" ? {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px) saturate(200%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "20px"
  } : {};
  const neomorphEffect = neumorphism ? {
    background: darkMode ? "#2d3748" : "#f0f0f0",
    boxShadow: darkMode ? "20px 20px 40px #1a202c, -20px -20px 40px #404c64" : "20px 20px 40px #d1d1d1, -20px -20px 40px #ffffff",
    border: "none"
  } : {};
  const phaseTransition = {
    opacity: loadingPhase === "completed" ? 0 : 1,
    transform: loadingPhase === "completing" ? "scale(1.1)" : "scale(1)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  };
  if (loadingPhase === "completed") {
    return null;
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: __spreadProps(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadProps(__spreadValues({}, styles.loaderContainer), {
        fontFamily: font
      }), backdropStyle), currentTheme), customStyle), phaseTransition), {
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? `fadeIn ${fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : void 0
      }),
      role: accessibility ? "status" : void 0,
      "aria-label": accessibility ? message || mergedLabels.loadingLabel : void 0,
      "aria-live": accessibility ? "polite" : void 0
    },
    /* @__PURE__ */ React.createElement("div", { style: __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadProps(__spreadValues({}, styles.contentContainer), {
      backgroundColor: currentTheme.card,
      boxShadow: currentTheme.shadow,
      borderRadius: rounded ? "24px" : "8px",
      border: `1px solid ${currentTheme.border}`
    }), glassEffect), neomorphEffect), hoverEffects && microInteractions ? {
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer"
    } : {}), magneticEffect ? {
      transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.02}px, ${(mousePosition.y - window.innerHeight / 2) * 0.02}px)`
    } : {}) }, renderIcon(), /* @__PURE__ */ React.createElement("div", { style: __spreadProps(__spreadValues({}, styles.loaderWrapper), { position: "relative" }) }, renderLoader()), typeof progress === "number" && showPercentage && /* @__PURE__ */ React.createElement("div", { style: __spreadProps(__spreadValues({}, styles.progressText), {
      color: currentTheme.highlight,
      textShadow: glow ? `0 0 12px rgba(${hexToRgb(color)}, ${glowIntensity})` : void 0,
      fontSize: "22px",
      fontWeight: 700,
      marginTop: 16,
      animation: animationType === "neon" ? "neon 2s ease-in-out infinite alternate" : void 0
    }) }, mergedLabels.percentLabel ? mergedLabels.percentLabel(progress) : `${Math.round(progress)}%`), (message || showLoadingText) && /* @__PURE__ */ React.createElement("div", { style: __spreadProps(__spreadValues({}, styles.message), {
      color: currentTheme.text,
      fontSize: "18px",
      fontWeight: 500,
      marginTop: 14,
      maxWidth: "400px",
      lineHeight: 1.6,
      textAlign: "center",
      animation: microInteractions ? "slideIn 0.6s ease-out" : void 0
    }) }, message || `${mergedLabels.loadingLabel}...`), showRetries && retries > 0 && /* @__PURE__ */ React.createElement("div", { style: __spreadValues(__spreadProps(__spreadValues({}, styles.retryText), {
      color: currentTheme.highlight,
      textShadow: glow ? `0 0 10px rgba(${hexToRgb(color)}, ${glowIntensity / 2})` : void 0,
      fontSize: "16px",
      fontWeight: 600,
      marginTop: 12,
      padding: "8px 16px",
      borderRadius: "12px",
      background: `rgba(${hexToRgb(color)}, 0.1)`,
      border: `1px solid rgba(${hexToRgb(color)}, 0.2)`
    }), pulseEffect ? { animation: "pulse 2s infinite ease-in-out" } : {}) }, mergedLabels.retryLabel, ": ", retries), showNetworkInfo && /* @__PURE__ */ React.createElement("div", { style: __spreadValues(__spreadProps(__spreadValues({}, styles.networkInfo), {
      backgroundColor: currentTheme.card,
      color: currentTheme.textSecondary,
      boxShadow: `0 8px 32px ${darkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"}`,
      borderRadius: "16px",
      padding: "16px 24px",
      marginTop: 20,
      border: `1px solid ${currentTheme.border}`,
      minWidth: "280px"
    }), glassEffect) }, /* @__PURE__ */ React.createElement("div", { style: styles.networkInfoItem }, /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoLabel), { color: currentTheme.text }) }, mergedLabels.speedLabel, ":"), /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoValue), {
      color: currentTheme.highlight,
      fontWeight: 700
    }) }, networkInfo.downlink !== null ? `${networkInfo.downlink} Mbps` : mergedLabels.gettingLabel)), /* @__PURE__ */ React.createElement("div", { style: styles.networkInfoItem }, /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoLabel), { color: currentTheme.text }) }, mergedLabels.typeLabel, ":"), /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoValue), { color: currentTheme.textSecondary }) }, networkInfo.effectiveType)), /* @__PURE__ */ React.createElement("div", { style: styles.networkInfoItem }, /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoLabel), { color: currentTheme.text }) }, mergedLabels.saveDataLabel, ":"), /* @__PURE__ */ React.createElement("span", { style: __spreadProps(__spreadValues({}, styles.networkInfoValue), {
      color: networkInfo.saveData ? darkMode ? "#10B981" : "#047857" : darkMode ? "#F87171" : "#DC2626",
      fontWeight: 600
    }) }, networkInfo.saveData ? mergedLabels.saveDataOn : mergedLabels.saveDataOff))), children && /* @__PURE__ */ React.createElement("div", { style: __spreadProps(__spreadValues({}, styles.childrenContainer), {
      animation: microInteractions ? "fadeIn 0.8s ease-out 0.2s both" : void 0
    }) }, children))
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
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 48px",
    maxWidth: "90%",
    borderRadius: "24px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
  },
  loaderWrapper: {
    margin: "24px 0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  retryText: {
    marginTop: 16,
    fontSize: "16px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    textAlign: "center"
  },
  networkInfo: {
    marginTop: 20,
    fontSize: "15px",
    textAlign: "center",
    borderRadius: "16px",
    padding: "16px 24px",
    width: "100%",
    maxWidth: "320px"
  },
  networkInfoItem: {
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  networkInfoLabel: {
    fontWeight: 500,
    marginRight: 12
  },
  networkInfoValue: {
    fontWeight: 600,
    textAlign: "right"
  },
  progressText: {
    marginTop: 16,
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textAlign: "center"
  },
  message: {
    marginTop: 16,
    fontSize: "16px",
    textAlign: "center",
    fontWeight: 500,
    lineHeight: 1.6,
    maxWidth: "400px"
  },
  childrenContainer: {
    marginTop: 24,
    width: "100%",
    textAlign: "center"
  }
};
var LoadingSpinner_default = Loader;

// src/extras.ts
import React2, { useCallback as useCallback2, useRef } from "react";
function useLoaderTelemetry() {
  const eventsRef = useRef([]);
  const logEvent = useCallback2((event, data) => {
    eventsRef.current.push({ event, data, timestamp: Date.now() });
  }, []);
  const getMetrics = useCallback2(() => eventsRef.current.slice(), []);
  return { logEvent, getMetrics };
}
var themeRegistry = {};
function registerLoaderTheme(theme) {
  if (!theme || !theme.name) {
    throw new Error('registerLoaderTheme: theme must have a unique "name" field');
  }
  themeRegistry[theme.name] = theme;
}
var animationRegistry = {};
function registerLoaderAnimation(key, component) {
  if (!key) throw new Error("registerLoaderAnimation: key is required");
  animationRegistry[key] = component;
}
function createCustomCache(impl) {
  return impl;
}
var LazyLoaderErrorBoundary = class extends React2.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("LazyLoaderErrorBoundary caught error:", error, info);
  }
  retry() {
    this.setState({ error: null });
  }
  render() {
    const { error } = this.state;
    if (error) {
      return this.props.fallback(error, this.retry);
    }
    return this.props.children;
  }
};

// src/retry.tsx
var defaultLFUCache = new LFUCache(5, 36e5);
var LazyLoaderContext = createContext({});
var LazyLoaderProvider = ({ value, children }) => /* @__PURE__ */ React3.createElement(LazyLoaderContext.Provider, { value }, children);
function useMergedOptions(options) {
  const contextOptions = useContext(LazyLoaderContext);
  return __spreadValues(__spreadValues({}, contextOptions || {}), options || {});
}
function useRetryDynamicImport(importFunction, options = {}) {
  var _a, _b, _c;
  const mergedOptions = useMergedOptions(options);
  const retryConfig = getConfig(mergedOptions.retry || {});
  const retryOpts = mergedOptions.retry || {};
  const effectiveRetryCondition = retryOpts.retryCondition || retryOpts.shouldRetry;
  const backoffMultiplier = (_a = retryOpts.backoffMultiplier) != null ? _a : 2;
  const useJitter = retryOpts.jitter === true;
  const [retryCount, setRetryCount] = useState2(0);
  const [error, setError] = useState2(null);
  const abortRef = useRef2(null);
  const cbOverrides = mergedOptions.circuitBreaker || {};
  const circuitBreakerConfig = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, retryConfig), cbOverrides), cbOverrides.failureThreshold !== void 0 ? { circuitBreakerThreshold: cbOverrides.failureThreshold } : {}), cbOverrides.recoveryTimeout !== void 0 ? { resetTimeMs: cbOverrides.recoveryTimeout } : {}), cbOverrides.threshold !== void 0 ? { circuitBreakerThreshold: cbOverrides.threshold } : {}), cbOverrides.resetTime !== void 0 ? { resetTimeMs: cbOverrides.resetTime } : {});
  const circuitBreaker = useRef2(new CircuitBreaker(circuitBreakerConfig));
  const cache = useMemo(() => {
    var _a2;
    if ((_a2 = mergedOptions.cache) == null ? void 0 : _a2.customCache) {
      return mergedOptions.cache.customCache;
    }
    const cacheOptions = mergedOptions.cache || {};
    const maxSize = cacheOptions.maxSize || 50;
    const maxAge = cacheOptions.maxAge || 36e5;
    return new LFUCache(maxSize, maxAge);
  }, [mergedOptions.cache]);
  const cacheKey = ((_b = mergedOptions.cache) == null ? void 0 : _b.key) ? mergedOptions.cache.key(importFunction) : ((_c = mergedOptions.cache) == null ? void 0 : _c.keyGenerator) ? mergedOptions.cache.keyGenerator(importFunction) : getRouteComponentUrl(importFunction);
  const loadComponent = useCallback3(() => __async(this, null, function* () {
    var _a2, _b2, _c2, _d, _e;
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
    if (typeof retryOpts.customDelayFn === "function") {
      adjustedDelay = retryOpts.customDelayFn(retryCount, error);
    }
    if (typeof retryOpts.strategy === "function") {
      adjustedDelay = retryOpts.strategy(retryCount, error);
    } else if (retryOpts.strategy === "exponential") {
      adjustedDelay = retryConfig.initialRetryDelayMs * Math.pow(backoffMultiplier, retryCount);
    } else if (retryOpts.strategy === "linear") {
      adjustedDelay = retryConfig.initialRetryDelayMs * (retryCount + 1);
    }
    if (useJitter) {
      const jitterFactor = Math.random() * 0.4 + 0.8;
      adjustedDelay = adjustedDelay * jitterFactor;
    }
    const importUrl = cacheKey;
    const cachedComponent = importUrl ? cache.get(importUrl) : null;
    if (cachedComponent) return Promise.resolve(cachedComponent);
    (_c2 = abortRef.current) == null ? void 0 : _c2.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    if (((_d = mergedOptions.mock) == null ? void 0 : _d.enabled) && mergedOptions.mock.mockImport) {
      return mergedOptions.mock.mockImport();
    }
    let actualImportFunction = importFunction;
    const importType = typeof mergedOptions.importFrom === "string" ? mergedOptions.importFrom : (_e = mergedOptions.importFrom) == null ? void 0 : _e.type;
    if (importType && importType !== "local") {
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
            const isValidModule = module && typeof module === "object" && "default" in module && module.default;
            if (!isValidModule) {
              throw new Error("Invalid module from dynamic import: missing default export");
            }
            if (importUrl) cache.set(importUrl, module);
            (_b3 = (_a3 = mergedOptions.retry) == null ? void 0 : _a3.onSuccess) == null ? void 0 : _b3.call(_a3, module);
            dequeueLoad();
            resolve(module);
          }).catch((err) => {
            var _a3, _b3, _c3, _d2, _e2, _f, _g, _h;
            (_b3 = (_a3 = mergedOptions.retry) == null ? void 0 : _a3.onRetry) == null ? void 0 : _b3.call(_a3, currentRetry, err);
            if (circuitBreaker.current.handleFailure()) {
              clearTimeout(timeoutId);
              (_d2 = (_c3 = mergedOptions.retry) == null ? void 0 : _c3.onError) == null ? void 0 : _d2.call(_c3, err);
              dequeueLoad();
              reject(err);
              return;
            }
            if (typeof effectiveRetryCondition === "function" && !effectiveRetryCondition(err)) {
              clearTimeout(timeoutId);
              (_f = (_e2 = mergedOptions.retry) == null ? void 0 : _e2.onError) == null ? void 0 : _f.call(_e2, err);
              dequeueLoad();
              reject(err);
              return;
            }
            if (currentRetry < adjustedRetryCount) {
              setTimeout(() => tryLoadComponent(currentRetry + 1), (currentRetry + 1) * adjustedDelay);
            } else {
              clearTimeout(timeoutId);
              (_h = (_g = mergedOptions.retry) == null ? void 0 : _g.onError) == null ? void 0 : _h.call(_g, err);
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
  const reset = useCallback3(() => {
    setRetryCount(0);
    setError(null);
    setComponent(() => lazy(loadComponent));
  }, [loadComponent]);
  const LazyWithErrorBoundary = React3.useMemo(() => {
    return React3.lazy(
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
var LoaderThemeProvider = ({ value, children }) => /* @__PURE__ */ React3.createElement(LoaderThemeContext.Provider, { value }, children);
function useLoaderTheme(theme) {
  const contextTheme = useContext(LoaderThemeContext);
  return theme || contextTheme || "light";
}
var LoaderAnimationRegistryContext = createContext({});
var LoaderAnimationRegistryProvider = ({ value, children }) => /* @__PURE__ */ React3.createElement(LoaderAnimationRegistryContext.Provider, { value }, children);
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
    secondaryColor: loaderConfig.secondaryColor,
    accentColor: loaderConfig.accentColor,
    gradient: loaderConfig.gradient,
    speed: loaderConfig.speed,
    showRetries: loaderConfig.showRetries,
    showNetworkInfo: loaderConfig.showNetworkInfo,
    disableNetworkInfo: loaderConfig.disableNetworkInfo,
    customStyle: loaderConfig.customStyle || loaderConfig.style,
    shadow: loaderConfig.shadow,
    glow: loaderConfig.glow,
    glowIntensity: loaderConfig.glowIntensity,
    // Use animationType if available, otherwise fall back to animation
    animationType: loaderConfig.animationType || loaderConfig.animation,
    icon: loaderConfig.icon,
    progress: loaderConfig.progress,
    message: loaderConfig.message || loaderConfig.loadingMessage,
    darkMode: loaderConfig.darkMode || theme === "dark",
    labels: {},
    blurBackground: loaderConfig.blurBackground,
    backdrop: loaderConfig.backdrop,
    backdropOpacity: loaderConfig.backdropOpacity,
    font: loaderConfig.font,
    rounded: loaderConfig.rounded,
    floatingStyle: loaderConfig.floatingStyle,
    pulseEffect: loaderConfig.pulseEffect || loaderConfig.pulse,
    glassmorphism: loaderConfig.glassmorphism,
    neumorphism: loaderConfig.neumorphism,
    vibrantColors: loaderConfig.vibrantColors,
    smoothTransitions: loaderConfig.smoothTransitions,
    microInteractions: loaderConfig.microInteractions,
    particleCount: loaderConfig.particleCount,
    showLoadingText: loaderConfig.showLoadingText,
    showPercentage: loaderConfig.showPercentage,
    customTheme: loaderConfig.customTheme,
    autoHideDelay: loaderConfig.autoHideDelay,
    fadeInDuration: loaderConfig.fadeInDuration,
    scaleEffect: loaderConfig.scaleEffect,
    colorShift: loaderConfig.colorShift,
    breathingEffect: loaderConfig.breathingEffect,
    magneticEffect: loaderConfig.magneticEffect,
    hoverEffects: loaderConfig.hoverEffects,
    accessibility: loaderConfig.accessibility,
    reducedMotion: loaderConfig.reducedMotion,
    highContrast: loaderConfig.highContrast,
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
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.progressiveFallback);
    }
    const ssrFallback = (_b2 = mergedOptions.ssr) == null ? void 0 : _b2.fallback;
    if (ssrFallback !== void 0 && ssrFallback !== null) {
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, ssrFallback);
    }
    return null;
  }
  if (error) {
    if (typeof loaderConfig.errorFallback === "function") {
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.errorFallback(error, reset));
    }
    if (typeof loaderConfig.fallbackStrategy === "function") {
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.fallbackStrategy(error));
    }
    if (loaderConfig.fallbackStrategy === "static" && loaderConfig.progressiveFallback) {
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.progressiveFallback);
    }
    if (loaderConfig.fallbackStrategy === "simple") {
      let msg = "Failed to load.";
      if (typeof loaderConfig.errorMessage === "function") {
        msg = loaderConfig.errorMessage(error);
      } else if (typeof loaderConfig.errorMessage === "string") {
        msg = loaderConfig.errorMessage;
      }
      return /* @__PURE__ */ React3.createElement("div", null, msg);
    }
    if (loaderConfig.fallbackStrategy === "none") {
      return null;
    }
    return loaderConfig.fallback ? /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.fallback) : /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center", padding: 24 }, role: "alert", "aria-live": "assertive" }, /* @__PURE__ */ React3.createElement("div", { style: { color: loaderConfig.errorColor || "red", marginBottom: 8 } }, loaderConfig.errorMessage ? typeof loaderConfig.errorMessage === "function" ? loaderConfig.errorMessage(error) : loaderConfig.errorMessage : `Error loading component: ${error.message}`), /* @__PURE__ */ React3.createElement(
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
      return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.multiStage.skeleton);
    }
    if (AnimationComponent) return /* @__PURE__ */ React3.createElement(AnimationComponent, __spreadValues({}, loaderProps));
    return /* @__PURE__ */ React3.createElement(React3.Fragment, null, (_e = (_d = loaderConfig.customLoader) != null ? _d : fallback) != null ? _e : /* @__PURE__ */ React3.createElement(LoadingSpinner_default, __spreadValues({}, loaderProps)));
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
  return /* @__PURE__ */ React3.createElement(Suspense, { fallback: ((_f = loaderConfig.multiStage) == null ? void 0 : _f.skeleton) && !showSpinner ? loaderConfig.multiStage.skeleton : AnimationComponent ? /* @__PURE__ */ React3.createElement(AnimationComponent, __spreadValues({}, loaderProps)) : fallback || loaderConfig.customLoader || /* @__PURE__ */ React3.createElement(LoadingSpinner_default, __spreadValues({}, loaderProps)) }, /* @__PURE__ */ React3.createElement(
    LazyLoaderErrorBoundary,
    {
      fallback: (err, retryFn) => {
        if (typeof loaderConfig.errorFallback === "function") {
          return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.errorFallback(err, retryFn));
        }
        if (typeof loaderConfig.fallbackStrategy === "function") {
          return /* @__PURE__ */ React3.createElement(React3.Fragment, null, loaderConfig.fallbackStrategy(err));
        }
        return /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center", padding: 24 }, role: "alert", "aria-live": "assertive" }, /* @__PURE__ */ React3.createElement("div", { style: { color: loaderConfig.errorColor || "red", marginBottom: 8 } }, `Error loading component: ${err.message}`), /* @__PURE__ */ React3.createElement(
          "button",
          {
            onClick: retryFn,
            style: loaderConfig.retryButtonStyle || { padding: "8px 16px", borderRadius: 4, cursor: "pointer" },
            "aria-label": loaderConfig.retryButtonText || "Retry"
          },
          loaderConfig.retryButtonText || "Retry"
        ));
      }
    },
    Component ? /* @__PURE__ */ React3.createElement(Component, __spreadValues({}, rest)) : null
  ));
};
function retryDynamicImport(importFunction, options) {
  return (props) => /* @__PURE__ */ React3.createElement(
    LazyLoader,
    __spreadValues({
      importFunction,
      options
    }, props)
  );
}
var prefetchDynamicImport = (importFunction, options) => {
  var _a, _b, _c;
  if (!(options == null ? void 0 : options.strategy) || options.strategy === "eager") {
    const retryImport = getRetryImportFunction(importFunction, 0);
    retryImport().then((module) => {
      var _a2, _b2, _c2;
      (_a2 = options == null ? void 0 : options.onSuccess) == null ? void 0 : _a2.call(options);
      if (((_b2 = options == null ? void 0 : options.cache) == null ? void 0 : _b2.enabled) && ((_c2 = options == null ? void 0 : options.cache) == null ? void 0 : _c2.key)) {
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
    }, { threshold: (_c = options.threshold) != null ? _c : 0 });
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
  LazyLoaderErrorBoundary,
  LazyLoaderProvider,
  LoadingSpinner_default as Loader,
  LoaderAnimationRegistryProvider,
  LoaderThemeProvider,
  createCustomCache,
  prefetchDynamicImport,
  priorityLoadComponent,
  registerLoaderAnimation,
  registerLoaderTheme,
  retryDynamicImport,
  useLoaderTelemetry,
  useRetryDynamicImport
};
