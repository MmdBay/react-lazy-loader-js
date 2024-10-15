"use strict";
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && (typeof from === "undefined" ? "undefined" : _type_of(from)) === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    prefetchDynamicImport: function() {
        return prefetchDynamicImport;
    },
    priorityLoadComponent: function() {
        return priorityLoadComponent;
    },
    retryDynamicImport: function() {
        return retryDynamicImport;
    }
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
        return Promise.resolve(importUrlWithVersionQuery).then(function(p) {
            return /*#__PURE__*/ _interop_require_wildcard(require(p));
        });
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
                retryImport().then(function(module2) {
                    clearTimeout(timeoutId);
                    if (importUrl) {
                        cacheComponent(importUrl, module2);
                    }
                    resolve(module2);
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
    return (0, import_react.lazy)(function() {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    prefetchDynamicImport: prefetchDynamicImport,
    priorityLoadComponent: priorityLoadComponent,
    retryDynamicImport: retryDynamicImport
});
