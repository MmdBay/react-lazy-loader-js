// src/retry.ts
import { lazy } from "react";
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
var getRouteComponentUrl = function(originalImport) {
    try {
        var _fnString_match;
        var fnString = originalImport.toString();
        return ((_fnString_match = fnString.match(/import\(["']([^)]+)['"]\)/)) === null || _fnString_match === void 0 ? void 0 : _fnString_match[1]) || null;
    } catch (e) {
        return null;
    }
};
var getRetryImportFunction = function(originalImport, retryCount) {
    var importUrl = getRouteComponentUrl(originalImport);
    if (!importUrl || retryCount === 0) return originalImport;
    var importUrlWithVersionQuery = importUrl.includes("?") ? "".concat(importUrl, "&v=").concat(retryCount, "-").concat(Math.random().toString(36).substring(2)) : "".concat(importUrl, "?v=").concat(retryCount, "-").concat(Math.random().toString(36).substring(2));
    return function() {
        return import(importUrlWithVersionQuery);
    };
};
// src/cache.ts
var cacheComponent = function(url, component) {
    localStorage.setItem(url, JSON.stringify(component));
};
var getCachedComponent = function(url) {
    var cachedComponent = localStorage.getItem(url);
    return cachedComponent ? JSON.parse(cachedComponent) : null;
};
// src/circuitBreaker.ts
var handleFailureWithCircuitBreaker = function(retryCount, param) {
    var circuitBreakerThreshold = param.circuitBreakerThreshold, resetTimeMs = param.resetTimeMs;
    if (retryCount >= circuitBreakerThreshold) {
        setTimeout(function() {
            return retryCount = 0;
        }, resetTimeMs);
        return true;
    }
    return false;
};
// src/retry.ts
function retryDynamicImport(importFunction) {
    var config = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultConfig;
    var retryCount = 0;
    var hasTimedOut = false;
    var maxRetryCount = config.maxRetryCount, timeoutMs = config.timeoutMs;
    var loadComponent = function() {
        return new Promise(function(resolve, reject) {
            var importUrl = getRouteComponentUrl(importFunction);
            var cachedComponent = importUrl ? getCachedComponent(importUrl) : null;
            if (cachedComponent) {
                resolve(cachedComponent);
                return;
            }
            var timeoutId = setTimeout(function() {
                hasTimedOut = true;
                reject(new Error("Component load timed out."));
            }, timeoutMs);
            function tryLoadComponent() {
                if (hasTimedOut) return;
                var retryImport = getRetryImportFunction(importFunction, retryCount);
                retryImport().then(function(module) {
                    clearTimeout(timeoutId);
                    if (importUrl) {
                        cacheComponent(importUrl, module);
                    }
                    resolve(module);
                }).catch(function(error) {
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
    };
    return lazy(function() {
        return loadComponent();
    });
}
var prefetchDynamicImport = function(importFunction) {
    var retryImport = getRetryImportFunction(importFunction, 0);
    retryImport().then(function() {
        return console.log("Component prefetched successfully.");
    }).catch(function(error) {
        return console.warn("Prefetching component failed:", error);
    });
};
var priorityLoadComponent = function(importFunction, priority) {
    setTimeout(function() {
        return retryDynamicImport(importFunction);
    }, priority * 1e3);
};
export { prefetchDynamicImport, priorityLoadComponent, retryDynamicImport };
