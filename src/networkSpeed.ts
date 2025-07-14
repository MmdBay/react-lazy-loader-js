declare global {
  interface Navigator {
    connection?: any;
  }
}

export interface NetworkInfo {
  effectiveType: string;
  type?: string;
  downlink: number;
  downlinkMax?: number;
  rtt?: number;
  saveData: boolean;
  latency?: number;
  lastTested: number;
  isEstimate: boolean;
  error?: string;
}

type NetworkChangeCallback = (info: NetworkInfo) => void;

let cachedInfo: NetworkInfo | null = null;
let cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

const listeners: Set<NetworkChangeCallback> = new Set();

function getNavigatorConnection(): any {
  if (typeof navigator !== 'undefined' && navigator.connection) {
    return navigator.connection;
  }
  return null;
}

function buildInfoFromAPI(conn: any): NetworkInfo {
  return {
    effectiveType: conn.effectiveType || 'unknown',
    type: conn.type,
    downlink: conn.downlink ?? 0,
    downlinkMax: conn.downlinkMax,
    rtt: conn.rtt,
    saveData: !!conn.saveData,
    latency: conn.rtt,
    lastTested: Date.now(),
    isEstimate: false,
  };
}

// Fallback: estimate speed by downloading a small image
async function estimateSpeedByImage(): Promise<NetworkInfo> {
  const imageUrl = 'https://www.google.com/images/phd/px.gif'; // 43 bytes
  const start = Date.now();
  let downlink = 0;
  let latency = 0;
  try {
    const before = Date.now();
    await fetch(imageUrl, { cache: 'no-store' });
    const after = Date.now();
    latency = after - before;
    // Assume 43 bytes in latency ms = (43 * 8) / (latency / 1000) bits/sec
    downlink = Math.max(0.01, (43 * 8) / (latency / 1000) / 1_000_000); // Mbps
  } catch (e) {
    // ignore
  }
  return {
    effectiveType: 'unknown',
    downlink,
    saveData: false,
    latency,
    lastTested: Date.now(),
    isEstimate: true,
    error: downlink === 0 ? 'Could not estimate speed' : undefined,
  };
}

/**
 * Get the best available network info (sync, may be cached)
 */
export function getNetworkInfoSync(): NetworkInfo {
  if (cachedInfo && Date.now() - cacheTime < CACHE_TTL) return cachedInfo;
  const conn = getNavigatorConnection();
  if (conn) {
    cachedInfo = buildInfoFromAPI(conn);
    cacheTime = Date.now();
    return cachedInfo;
  }
  // Fallback: return a default mock
  return {
    effectiveType: 'unknown',
    downlink: 0,
    saveData: false,
    lastTested: Date.now(),
    isEstimate: true,
    error: 'No Network Information API',
  };
}

/**
 * Get the best available network info (async, will try to estimate if needed)
 */
export async function getNetworkInfo(forceRefresh = false): Promise<NetworkInfo> {
  if (!forceRefresh && cachedInfo && Date.now() - cacheTime < CACHE_TTL) return cachedInfo;
  const conn = getNavigatorConnection();
  if (conn) {
    cachedInfo = buildInfoFromAPI(conn);
    cacheTime = Date.now();
    return cachedInfo;
  }
  // Fallback: estimate by image
  cachedInfo = await estimateSpeedByImage();
  cacheTime = Date.now();
  return cachedInfo;
}

/**
 * Subscribe to network info changes (browser only)
 */
export function subscribeNetworkInfo(cb: NetworkChangeCallback): () => void {
  listeners.add(cb);
  // Initial call
  getNetworkInfo().then(cb);
  // Listen for changes
  const conn = getNavigatorConnection();
  if (conn && conn.addEventListener) {
    const handler = () => getNetworkInfo().then(cb);
    conn.addEventListener('change', handler);
    return () => {
      listeners.delete(cb);
      conn.removeEventListener('change', handler);
    };
  }
  // No real event, just unsubscribe
  return () => listeners.delete(cb);
}

/**
 * Manually refresh and update all listeners
 */
export async function refreshNetworkInfo() {
  const info = await getNetworkInfo(true);
  listeners.forEach((cb) => cb(info));
}