
# React Dynamic Retry Loader

[![npm version](https://badge.fury.io/js/react-lazy-loader-js.svg)](https://badge.fury.io/js/react-lazy-loader-js)

`react-lazy-loader-js` is a highly flexible, production-grade loader for dynamically importing React components. It features robust retry logic, advanced caching, circuit breaker support, prefetching, priority and batch loading, SSR/SSG compatibility, context-based configuration, theme and animation registries, accessibility, and much more. Designed for both enterprise and open source projects, it gives you full control over how your components are loaded, retried, and displayed.

---

## 🚀 Features
- **Dynamic Retry Logic**: Smart, customizable retry strategies (exponential, linear, custom) with jitter and exponential back-off.
- **Circuit Breaker**: Prevents excessive retries and automatically recovers once the service stabilises.
- **Advanced Caching**: LFU, LRU, in-memory, `localStorage`, `IndexedDB` or a fully custom cache.
- **SSR/SSG & Suspense-less**: First-class support for server-side rendering and environments where `React.Suspense` isn’t available.
- **Prefetching & Priority Loading**: Prefetch on hover/visible/idle and control load priority or batching.
- **Batching & Concurrency Control**: Limit concurrent imports and process the rest in batches.
- **Progressive Enhancement & Error Recovery**: Static fallbacks, multi-stage loaders and custom error boundaries.
- **Theme & Animation Registry**: Register global themes/animations or inject your own loader component.
- **Accessibility (A11y)**: ARIA roles, live regions and full screen-reader support.
- **Telemetry & Logging**: Emit granular events you can pipe into any analytics/monitoring tool.
- **Remote/CDN Import**: Seamlessly pull components from remote bundles or CDNs.
- **Test/Mock API**: Swap real imports with mocks in your test suite with one flag.

---

## 📦 Installation

```bash
npm install react-lazy-loader-js
```

Or with yarn:

```bash
yarn add react-lazy-loader-js
```

---

## 🚀 Quick Start

### 1. Basic Retry Loader

```tsx
import React from 'react';
import { retryDynamicImport, LazyLoader } from 'react-lazy-loader-js';

// Simple dynamic import with retry
const LazyComponent = retryDynamicImport(() => import('./MyComponent'));

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}
```

### 2. Suspense-less Loading (No React.Suspense)

```tsx
import { LazyLoader } from 'react-lazy-loader-js';

function App() {
  return (
    <LazyLoader
      importFunction={() => import('./MyComponent')}
      options={{ 
        suspense: false,
        loader: { message: 'Loading component...' }
      }}
    />
  );
}
```

### 3. Server-Side Rendering (Next.js – App Router)

```tsx
"use client";
import { LazyLoader } from 'react-lazy-loader-js';

export default function Page() {
  return (
    <LazyLoader
      importFunction={() => import('../components/pages/auth/login/index')}
      options={{
        suspense: false,
        retry: { maxRetryCount: 3, strategy: 'exponential', initialRetryDelayMs: 800 },
        loader: { theme: 'dark', animationType: 'pulse', message: 'Loading...', size: 48 },
        cache: { enabled: true, type: 'lfu', maxAge: 60 * 60 * 1000 },
      }}
    />
  );
}
```

### 4. Prefetch On Hover

```tsx
import { prefetchDynamicImport } from 'react-lazy-loader-js';
import { useRef } from 'react';

const ref = useRef<HTMLButtonElement>(null);

prefetchDynamicImport(() => import('./HeavyChart'), {
  strategy: 'on-hover',
  elementRef: ref,
});
```

### 5. Circuit Breaker Example

```tsx
import { LazyLoader } from 'react-lazy-loader-js';

function ReportsWidget() {
  return (
    <LazyLoader
      importFunction={() => import('./Reports')}
      options={{
        suspense: false,
        circuitBreaker: { enabled: true, threshold: 3, resetTime: 30000 },
        retry: { maxRetryCount: 3 },
        loader: { message: 'Loading reports...' }
      }}
    />
  );
}
```

### 6. LazyLoader Component (Full control)

```tsx
import React from 'react';
import { LazyLoader } from 'react-lazy-loader-js';

function App() {
  return (
    <LazyLoader
      importFunction={() => import('./MyComponent')}
      options={{
        suspense: false,
        retry: {
          maxRetryCount: 3,
          strategy: 'linear',
          initialRetryDelayMs: 500,
        },
        loader: {
          theme: 'dark',
          animationType: 'spin',
          size: 48,
          message: 'Loading user profile...',
          errorFallback: (error, retry) => (
            <div>
              <p>Failed to load: {error.message}</p>
              <button onClick={retry}>Retry</button>
            </div>
          ),
        },
        cache: {
          enabled: true,
          type: 'lfu',
          maxSize: 50,
        },
      }}
    />
  );
}
```

---

## 📚 Complete API Documentation

### Core Functions

#### `retryDynamicImport(importFunction, options?)`

Creates a lazy React component with advanced retry and loading capabilities.

**Parameters:**
- `importFunction`: Function that returns a dynamic import promise
- `options`: Configuration object (optional)

**Returns:** A React component that can be used with React.Suspense

**Example:**
```tsx
import { retryDynamicImport } from 'react-lazy-loader-js';

const LazyComponent = retryDynamicImport(
  () => import('./MyComponent'),
  {
    retry: {
      maxRetryCount: 5,
      strategy: 'exponential',
      initialRetryDelayMs: 1000,
      maxRetryDelayMs: 10000,
    },
    cache: {
      type: 'lfu',
      maxSize: 100,
      maxAge: 3600000,
    },
    loader: {
      theme: 'light',
      animationType: 'wave',
      size: 64,
      message: 'Loading component...',
    },
  }
);
```

#### `LazyLoader` Component

A React component that provides full control over lazy loading behavior.

**Props:**
- `importFunction`: Function that returns a dynamic import promise
- `options`: Complete configuration object
- `children`: Optional children to render when component is loaded
- `fallback`: Optional custom fallback component

**Example:**
```tsx
import { LazyLoader } from 'react-lazy-loader-js';

function App() {
  return (
    <LazyLoader
      importFunction={() => import('./MyComponent')}
      options={{
        suspense: false,
        retry: {
          maxRetryCount: 3,
          strategy: 'linear',
          initialRetryDelayMs: 500,
        },
        loader: {
          theme: 'dark',
          animationType: 'spin',
          size: 48,
          message: 'Loading user profile...',
          errorFallback: (error, retry) => (
            <div>
              <p>Failed to load: {error.message}</p>
              <button onClick={retry}>Retry</button>
            </div>
          ),
        },
        cache: {
          enabled: true,
          type: 'lfu',
          maxSize: 50,
        },
      }}
    />
  );
}
```

### Configuration Options

#### Retry Configuration

```tsx
retry: {
  maxRetryCount: 3,               // Maximum number of retry attempts
  strategy: 'exponential',        // 'exponential', 'linear', 'custom'
  initialRetryDelayMs: 1000,      // Base delay in milliseconds
  maxRetryDelayMs: 10000,         // Maximum delay in milliseconds
  backoffMultiplier: 2,          // Multiplier for exponential backoff
  jitter: true,                  // Add random jitter to delays
  onRetry: (attempt, error) => {}, // Callback on each retry
  shouldRetry: (error) => true,  // Custom retry condition
}
```

#### Loader Configuration

```tsx
loader: {
  theme: 'light',                // 'light', 'dark', 'custom'
  animationType: 'spin',         // 'spin', 'pulse', 'wave', 'bounce', etc.
  size: 48,                      // Loader diameter in px
  message: 'Loading...',
  customStyle: { color: 'blue' }, // Custom inline styles
  glow: true,                    // Enable glow effect
  pulseEffect: true,             // Enable pulse effect
  gradient: ['#ff0099', '#00ff99'], // Gradient colors array
  // Note: customAnimation requires animation registry
}
```

#### Cache Configuration

```tsx
cache: {
  enabled: true,                 // Enable caching
  type: 'lfu',                   // 'lfu', 'lru', 'memory'
  maxSize: 100,                  // Maximum number of cached items
  maxAge: 3600000,               // Maximum age in milliseconds
  customCache: customCacheImpl,  // Custom cache implementation
}
```

#### Error Handling Configuration

```tsx
errorFallback: (error, retry, reset) => {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={retry}>Retry</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
},
fallbackStrategy: 'retry',       // 'retry', 'static', 'progressive'
progressiveFallback: <div>Static fallback</div>,
```

#### SSR/SSG Configuration

```tsx
ssr: {
  fallback: <div>SSR fallback</div>, // Fallback for server-side rendering
  enabled: true,                 // Enable SSR support
  suspense: false,               // Disable React.Suspense
  preload: false,                // Preload on server
}
```

#### Accessibility Configuration

```tsx
a11y: {
  label: 'Loading component...',  // ARIA label
  role: 'status',                // ARIA role
  live: 'polite',                // ARIA live region
  describedBy: 'loading-desc',   // ARIA described by
}
```

#### Telemetry Configuration

```tsx
log: {
  enabled: true,                 // Enable logging
  level: 'info',                 // 'debug', 'info', 'warn', 'error'
  telemetryHook: (event) => {},  // Custom telemetry hook
  events: ['load', 'retry', 'error', 'cache'], // Events to log
}
```

### Context Providers

#### `LazyLoaderProvider`

Provides global configuration for all lazy loaders in the app.

```tsx
import { LazyLoaderProvider } from 'react-lazy-loader-js';

const globalConfig = {
  retry: {
    maxRetryCount: 3,
    strategy: 'exponential',
    initialRetryDelayMs: 1000,
  },
  loader: {
    theme: 'dark',
    animationType: 'wave',
    size: 48,
  },
  cache: {
    type: 'lfu',
    maxSize: 100,
    maxAge: 3600000,
  },
  log: {
    enabled: true,
    level: 'info',
  },
};

function App() {
  return (
    <LazyLoaderProvider value={globalConfig}>
      {/* All lazy loaders will inherit this configuration */}
      <YourApp />
    </LazyLoaderProvider>
  );
}
```

#### `LoaderThemeProvider`

Provides global theme for all loaders.

```tsx
import { LoaderThemeProvider } from 'react-lazy-loader-js';

function App() {
  return (
    <LoaderThemeProvider value="dark">
      {/* All loaders will use dark theme by default */}
      <YourApp />
    </LoaderThemeProvider>
  );
}
```

#### `LoaderAnimationRegistryProvider`

Registers custom loader animations globally.

```tsx
import { LoaderAnimationRegistryProvider } from 'react-lazy-loader-js';
import MyCustomAnimation from './MyCustomAnimation';

const animationRegistry = {
  myCustom: MyCustomAnimation,
  anotherCustom: AnotherCustomAnimation,
};

function App() {
  return (
    <LoaderAnimationRegistryProvider value={animationRegistry}>
      {/* Custom animations can now be used by name */}
      <YourApp />
    </LoaderAnimationRegistryProvider>
  );
}
```

### Utility Functions

#### `prefetchDynamicImport(importFunction, options?)`

Prefetches a component using various strategies.

```tsx
import { prefetchDynamicImport } from 'react-lazy-loader-js';

// Prefetch immediately
prefetchDynamicImport(() => import('./MyComponent'));

// Prefetch on hover
const ref = useRef(null);
prefetchDynamicImport(() => import('./MyComponent'), {
  strategy: 'on-hover',
  elementRef: ref,
});

// Prefetch when idle
prefetchDynamicImport(() => import('./MyComponent'), {
  strategy: 'idle',
  timeout: 5000,
});

// Prefetch when visible
prefetchDynamicImport(() => import('./MyComponent'), {
  strategy: 'on-visible',
  threshold: 0.1,
});
```

**Strategy Options:**
- `'eager'`: Prefetch immediately
- `'idle'`: Prefetch when browser is idle
- `'on-hover'`: Prefetch when element is hovered
- `'on-visible'`: Prefetch when element becomes visible
- `'on-focus'`: Prefetch when element receives focus

#### `priorityLoadComponent(importFunction, options?)`

Loads a component with priority and delay.

```tsx
import { priorityLoadComponent } from 'react-lazy-loader-js';

// Load with priority
priorityLoadComponent(() => import('./LowPriorityComponent'), {
  priority: 2,
  delay: 2000,
});

// Load after user interaction
priorityLoadComponent(() => import('./Component'), {
  priority: 1,
  trigger: 'user-interaction',
});
```

### Advanced Features

#### Multi-Stage Loading

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    loader: {
      message: 'Loading component...',
      multiStage: {
        skeleton: <div className="skeleton-loader" />,
        delay: 500, // Show skeleton for 500ms before spinner
        transition: 'fade', // Transition type
      },
    },
  }}
/>
```

#### Circuit Breaker

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      resetTime: 30000,
      onOpen: () => console.log('Circuit breaker opened'),
      onClose: () => console.log('Circuit breaker closed'),
    },
    loader: { message: 'Loading with circuit breaker...' }
  }}
/>
```

#### Batching and Concurrency

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    batching: {
      enabled: true,
      maxConcurrent: 3,
      batchSize: 5,
      delay: 100,
    },
    loader: { message: 'Loading in batch...' }
  }}
/>
```

#### Remote/CDN Import

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    importFrom: {
      type: 'cdn',
      baseUrl: 'https://cdn.example.com',
      fallback: 'local',
    },
    loader: { message: 'Loading from CDN...' }
  }}
/>
```

#### Mock/Test API

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    mock: {
      enabled: process.env.NODE_ENV === 'test',
      mockImport: async () => ({
        default: () => <div>Mocked Component</div>,
      }),
      delay: 100, // Simulate loading delay
    },
    loader: { message: 'Loading test component...' }
  }}
/>
```

### Custom Hooks

#### `useRetryDynamicImport`

Custom hook for advanced retry logic with abort support.

```tsx
import { useRetryDynamicImport } from 'react-lazy-loader-js';

function MyComponent() {
  const { load, loading, error, retry, abort } = useRetryDynamicImport(
    () => import('./MyComponent'),
    {
      maxRetryCount: 3,
      strategy: 'exponential',
    }
  );

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Component loaded!</div>;
}
```

#### `useLoaderTelemetry`

Custom hook for telemetry and logging.

```tsx
import { useLoaderTelemetry } from 'react-lazy-loader-js';

function MyComponent() {
  const { logEvent, getMetrics } = useLoaderTelemetry();

  const handleLoad = () => {
    logEvent('component_load_start', { component: 'MyComponent' });
    // ... load logic
    logEvent('component_load_success', { component: 'MyComponent' });
  };

  return <button onClick={handleLoad}>Load Component</button>;
}
```

### Error Handling

#### Custom Error Boundaries

```tsx
import { LazyLoaderErrorBoundary } from 'react-lazy-loader-js';

function App() {
  return (
    <LazyLoaderErrorBoundary
      fallback={(error, retry) => (
        <div>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
    >
      <LazyComponent />
    </LazyLoaderErrorBoundary>
  );
}
```

#### Progressive Enhancement

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    progressive: {
      enabled: true,
      fallback: <StaticComponent />,
      strategy: 'graceful-degradation',
    },
    loader: { message: 'Loading enhanced component...' }
  }}
/>
```

### Performance Optimization

#### Memory Management

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    memory: {
      cleanup: true,
      maxAge: 300000, // 5 minutes
      onCleanup: (key) => console.log('Cleaned up:', key),
    },
    loader: { message: 'Loading with memory management...' }
  }}
/>
```

#### Network Optimization

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    suspense: false,
    network: {
      adaptive: true,
      speedThreshold: 1000, // 1Mbps
      compression: true,
      preload: 'metadata',
    },
    loader: { message: 'Loading with network optimization...' }
  }}
/>
```

---

## 🎨 Customization

### Custom Loader Themes

```tsx
import { registerLoaderTheme } from 'react-lazy-loader-js';

const customTheme = {
  name: 'custom',
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#f8f9fa',
  },
  styles: {
    container: 'custom-loader-container',
    spinner: 'custom-loader-spinner',
    message: 'custom-loader-text',
  },
};

registerLoaderTheme(customTheme);
```

### Custom Animations

```tsx
import { registerLoaderAnimation } from 'react-lazy-loader-js';

const CustomAnimation = ({ size, theme, text }) => (
  <div className={`custom-animation ${size} ${theme}`}>
    <div className="spinner" />
    {text && <span>{text}</span>}
  </div>
);

registerLoaderAnimation('custom', CustomAnimation);
```

### Custom Cache Implementation

```tsx
import { createCustomCache } from 'react-lazy-loader-js';

const customCache = createCustomCache({
  get: (key) => {
    // Custom get logic
  },
  set: (key, value, options) => {
    // Custom set logic
  },
  delete: (key) => {
    // Custom delete logic
  },
  clear: () => {
    // Custom clear logic
  },
});
```

---

## 🔧 Configuration Reference

### Complete Options Object

```tsx
const completeOptions = {
  // Retry configuration
  retry: {
    maxRetryCount: 3,
    strategy: 'exponential',
    initialRetryDelayMs: 1000,
    maxRetryDelayMs: 10000,
    backoffMultiplier: 2,
    jitter: true,
    onRetry: (attempt, error) => {},
    shouldRetry: (error) => true,
  },

  // Loader configuration
  loader: {
    theme: 'light',
    animationType: 'spin',
    size: 48,
    message: 'Loading...',
    customStyle: {},
    glow: true,
    pulseEffect: true,
    gradient: ['#6366f1', '#8b5cf6'],
    multiStage: {
      skeleton: null,
      delay: 0,
      transition: 'fade',
    },
  },

  // Cache configuration
  cache: {
    enabled: true,
    type: 'lfu',
    maxSize: 100,
    maxAge: 3600000,
    customCache: null,
  },

  // Error handling
  errorFallback: null,
  fallbackStrategy: 'retry',
  progressiveFallback: null,

  // SSR/SSG
  ssr: {
    fallback: null,
    enabled: true,
    suspense: true,
    preload: false,
  },

  // Accessibility
  a11y: {
    label: 'Loading...',
    role: 'status',
    live: 'polite',
    describedBy: null,
  },

  // Telemetry
  log: {
    enabled: false,
    level: 'info',
    telemetryHook: null,
    events: ['load', 'retry', 'error', 'cache'],
  },

  // Circuit breaker
  circuitBreaker: {
    enabled: false,
    threshold: 5,
    resetTime: 30000,
    onOpen: null,
    onClose: null,
  },

  // Batching
  batching: {
    enabled: false,
    maxConcurrent: 3,
    batchSize: 5,
    delay: 100,
  },

  // Import options
  importFrom: {
    type: 'local',
    baseUrl: null,
    fallback: null,
  },

  // Mock/Test
  mock: {
    enabled: false,
    mockImport: null,
    delay: 0,
  },

  // Memory management
  memory: {
    cleanup: false,
    maxAge: 300000,
    onCleanup: null,
  },

  // Network optimization
  network: {
    adaptive: false,
    speedThreshold: 1000,
    compression: false,
    preload: null,
  },

  // Progressive enhancement
  progressive: {
    enabled: false,
    fallback: null,
    strategy: 'graceful-degradation',
  },
};
```

---

## 🧪 Testing

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import { retryDynamicImport } from 'react-lazy-loader-js';

// Mock dynamic import
jest.mock('./MyComponent', () => ({
  __esModule: true,
  default: () => <div>Mocked Component</div>,
}));

test('renders lazy component', async () => {
  const LazyComponent = retryDynamicImport(() => import('./MyComponent'));
  
  render(
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </React.Suspense>
  );

  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await screen.findByText('Mocked Component');
  expect(screen.getByText('Mocked Component')).toBeInTheDocument();
});
```

### Integration Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LazyLoader } from 'react-lazy-loader-js';

test('handles retry on error', async () => {
  const mockImport = jest.fn().mockRejectedValueOnce(new Error('Network error'));
  
  render(
    <LazyLoader
      importFunction={mockImport}
      options={{
        suspense: false,
        retry: { maxRetryCount: 2 },
        loader: {
          message: 'Loading...',
          errorFallback: (error, retry) => (
            <button onClick={retry}>Retry</button>
          ),
        },
      }}
    />
  );

  await screen.findByText('Retry');
  fireEvent.click(screen.getByText('Retry'));
  
  expect(mockImport).toHaveBeenCalledTimes(2);
});
```

---

## 🚀 Performance Best Practices

### 1. Use Appropriate Cache Strategy

```tsx
// For frequently accessed components
cache: { enabled: true, type: 'lfu', maxSize: 50 }

// For large components with limited memory
cache: { enabled: true, type: 'lfu', maxSize: 20 }

// For persistent caching with TTL
cache: { enabled: true, type: 'lfu', maxSize: 100, maxAge: 86400000 }
```

### 2. Implement Smart Prefetching

```tsx
// Prefetch critical components immediately
prefetchDynamicImport(() => import('./CriticalComponent'), {
  strategy: 'eager',
});

// Prefetch on user interaction
prefetchDynamicImport(() => import('./UserProfile'), {
  strategy: 'on-hover',
});
```

### 3. Use Circuit Breaker for Unreliable APIs

```tsx
circuitBreaker: {
  enabled: true,
  threshold: 3,
  resetTime: 60000,
}
```

### 4. Optimize for Network Conditions

```tsx
network: {
  adaptive: true,
  speedThreshold: 1000, // 1Mbps
  compression: true,
}
```

### 5. Implement Progressive Enhancement

```tsx
progressive: {
  enabled: true,
  fallback: <StaticComponent />,
  strategy: 'graceful-degradation',
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Component Not Loading

```tsx
// Check if dynamic import is working
const LazyComponent = retryDynamicImport(() => import('./MyComponent'), {
  log: { enabled: true, level: 'debug' },
});
```

#### 2. Retry Not Working

```tsx
// Ensure retry configuration is correct
retry: {
  maxRetryCount: 3,
  strategy: 'exponential',
  shouldRetry: (error) => {
    // Only retry network errors
    return error.name === 'NetworkError';
  },
}
```

#### 3. Cache Not Working

```tsx
// Check cache configuration
cache: {
  type: 'lfu',
  maxSize: 100,
  onHit: (key) => console.log('Cache hit:', key),
  onMiss: (key) => console.log('Cache miss:', key),
}
```

#### 4. SSR Issues

```tsx
// Ensure SSR is properly configured
ssr: {
  enabled: true,
  fallback: <div>SSR fallback</div>,
  suspense: false,
}
```

### Debug Mode

```tsx
// Enable debug mode for detailed logging
const LazyComponent = retryDynamicImport(() => import('./MyComponent'), {
  log: {
    enabled: true,
    level: 'debug',
    telemetryHook: (event) => {
      console.log('Loader Event:', event);
    },
  },
});
```

---

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/mmdbay/react-lazy-loader-js.git
cd react-lazy-loader-js
npm install
npm run dev
```

### Running Tests

```bash
npm test
npm run test:coverage
```

### Building

```bash
npm run build
```

---

## 📚 Additional Resources

- [React Dynamic Import Documentation](https://reactjs.org/docs/code-splitting.html)
- [Webpack Dynamic Import](https://webpack.js.org/guides/code-splitting/)
- [React Suspense](https://reactjs.org/docs/react-api.html#reactsuspense)
- [Error Boundaries](https://reactjs.org/docs/error-boundaries.html)

---

## 🆘 Support

If you need help or have questions:

- 📖 [Documentation](https://github.com/mmdbay/react-lazy-loader-js#readme)
- 🐛 [Issues](https://github.com/mmdbay/react-lazy-loader-js/issues)
- 💬 [Discussions](https://github.com/mmdbay/react-lazy-loader-js/discussions)
- 📧 [Email Support](mailto:muhammadhasanbeygi@gmail.com)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=mmdbay/react-lazy-loader-js&type=Date)](https://star-history.com/#mmdbay/react-lazy-loader-js&Date)

### Using with Next.js (App Router)

```tsx
"use client";
import { LazyLoader } from "react-lazy-loader-js";

export default function Page() {
  return (
    <div>
      <LazyLoader
        importFunction={() => import("../components/pages/auth/login/index")}
        options={{
          suspense: false,               // Disable Suspense to avoid streaming issues
          retry: {
            maxRetryCount: 3,
            strategy: "exponential",
            initialRetryDelayMs: 800,
          },
          loader: {
            theme: "dark",
            animation: "pulse",
            message: "Loading...",
            size: 48,
          },
          cache: {
            enabled: true,
            type: "lfu",
            maxAge: 60 * 60 * 1000, // 1 hour
          },
        }}
      />
    </div>
  );
}
```

## 💅 Advanced Loading Spinner

Our package includes an extremely beautiful, highly customizable loading spinner component with modern animations, visual effects, and professional themes. Built with cutting-edge design principles for maximum user experience.

### 🎨 Basic Usage

```jsx
import { Loader } from 'react-lazy-loader-js';

function LoadingPage() {
  return (
    <Loader
      size={100}
      color="#6366f1"
      animationType="gradient-spin"
      message="Loading your amazing content..."
      showNetworkInfo={true}
    />
  );
}
```

### 🚀 Advanced Examples

#### Professional Glassmorphism Theme
```jsx
<Loader
  size={120}
  animationType="particles"
  customTheme="glass"
  glassmorphism={true}
  vibrantColors={true}
  gradient={["#ff0099", "#00ff99", "#9900ff", "#ff9900", "#0099ff"]}
  message="Loading with style..."
  glow={true}
  glowIntensity={0.8}
  microInteractions={true}
  floatingStyle={true}
  particleCount={8}
  showNetworkInfo={true}
/>
```

#### Modern Gradient Theme
```jsx
<Loader
  size={80}
  animationType="orbit"
  customTheme="gradient"
  colorShift={true}
  breathingEffect={true}
  magneticEffect={true}
  scaleEffect={true}
  smoothTransitions={true}
  message="Almost there..."
  showPercentage={true}
  progress={75}
/>
```

#### Neon Cyberpunk Style
```jsx
<Loader
  size={90}
  animationType="neon"
  customTheme="neon"
  glow={true}
  glowIntensity={1.0}
  hoverEffects={true}
  pulseEffect={true}
  message="Entering the matrix..."
  darkMode={true}
/>
```

#### Minimal Clean Design
```jsx
<Loader
  size={60}
  animationType="spiral"
  customTheme="minimal"
  reducedMotion={false}
  accessibility={true}
  message="Simple and elegant"
  showRetries={true}
  retries={2}
/>
```

#### Neumorphism Effect
```jsx
<Loader
  size={100}
  animationType="elastic"
  neumorphism={true}
  customTheme="modern"
  rounded={true}
  autoHideDelay={5000}
  fadeInDuration={1000}
  message="Soft and modern design"
/>
```

### 🎭 Available Animation Types

#### Classic Animations
- `spin` - Classic rotating spinner with smooth easing
- `dots` - Bouncing dots with physics-based animation
- `wave` - Audio equalizer-style wave animation
- `pulse` - Breathing circle with scale animation

#### Modern Animations
- `gradient-spin` - **NEW!** Color-shifting gradient spinner
- `particles` - **NEW!** Floating particle effects
- `spiral` - **NEW!** Elegant spiral rotation
- `orbit` - **NEW!** Planetary orbit animation

#### Advanced Animations
- `bounce` - **NEW!** Physics-based bouncing effect
- `morph` - **NEW!** Shape-morphing animation
- `elastic` - **NEW!** Elastic scale and rotation
- `flip` - **NEW!** 3D flip animation
- `scale` - **NEW!** Dynamic scaling effect
- `neon` - **NEW!** Glowing neon style

### 🎨 Professional Themes

#### `modern` (Default)
Clean, contemporary design with subtle shadows and smooth transitions.
```jsx
<Loader customTheme="modern" />
```

#### `glass`
Glassmorphism effect with blur, transparency, and modern aesthetics.
```jsx
<Loader customTheme="glass" glassmorphism={true} />
```

#### `neon`
Cyberpunk-inspired neon colors with glowing effects.
```jsx
<Loader customTheme="neon" />
```

#### `minimal`
Ultra-clean minimalist design with no unnecessary elements.
```jsx
<Loader customTheme="minimal" />
```

#### `gradient`
Beautiful gradient backgrounds with vibrant colors.
```jsx
<Loader customTheme="gradient" />
```

#### `classic`
Timeless elegant design with traditional styling.
```jsx
<Loader customTheme="classic" />
```

### ✨ Advanced Visual Effects

#### Glassmorphism
```jsx
<Loader
  glassmorphism={true}
  blurBackground={true}
  customTheme="glass"
/>
```

#### Neumorphism
```jsx
<Loader
  neumorphism={true}
  customTheme="modern"
  darkMode={false}
/>
```

#### Magnetic Cursor Effect
```jsx
<Loader
  magneticEffect={true}
  hoverEffects={true}
  microInteractions={true}
/>
```

#### Color Shifting
```jsx
<Loader
  colorShift={true}
  vibrantColors={true}
  gradient={["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"]}
/>
```

### 🎪 Animation Customization

#### Particle Effects
```jsx
<Loader
  animationType="particles"
  particleCount={10}
  vibrantColors={true}
  glow={true}
  glowIntensity={0.7}
/>
```

#### Floating & Breathing
```jsx
<Loader
  floatingStyle={true}
  breathingEffect={true}
  scaleEffect={true}
  smoothTransitions={true}
/>
```

#### Micro-interactions
```jsx
<Loader
  microInteractions={true}
  hoverEffects={true}
  smoothTransitions={true}
  accessibility={true}
/>
```

### 🌟 Complete Feature Set

#### Visual Customization
- **Size**: From 40px to 200px+
- **Colors**: Primary, secondary, accent colors
- **Gradients**: Multi-color gradients with vibrant options
- **Glow Effects**: Adjustable intensity glow
- **Shadows**: Professional drop shadows
- **Rounded Corners**: Modern border radius
- **Transparency**: Backdrop and glassmorphism effects

#### Animation Features
- **20+ Animations**: From classic to cutting-edge
- **Speed Control**: Adjustable animation timing
- **Easing Functions**: Smooth cubic-bezier transitions
- **Particle Systems**: Configurable particle count
- **3D Effects**: Perspective and depth
- **Color Shifts**: Dynamic color transitions

#### User Experience
- **Accessibility**: Full ARIA support and screen reader compatibility
- **Reduced Motion**: Respects user preferences
- **Auto-hide**: Programmable disappearing
- **Fade Transitions**: Smooth entrance/exit
- **Progress Tracking**: Real-time progress display
- **Network Info**: Connection speed and data saver status

#### Professional Polish
- **6 Themes**: From minimal to cyberpunk
- **Glassmorphism**: Modern blur effects
- **Neumorphism**: Soft UI design
- **Magnetic Effects**: Interactive cursor following
- **Loading Phases**: Multi-stage loading states
- **Error Handling**: Graceful error recovery

### 📱 Responsive & Accessible

```jsx
<Loader
  // Accessibility features
  accessibility={true}
  reducedMotion={false}
  highContrast={false}
  
  // Responsive design
  size={window.innerWidth < 768 ? 60 : 100}
  customStyle={{
    '@media (max-width: 768px)': {
      padding: '20px'
    }
  }}
  
  // Professional typography
  font="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
/>
```

### 🔧 All Available Props

```jsx
<Loader
  // Basic properties
  size={80}
  borderSize={6}
  color="#6366f1"
  secondaryColor="#e0e7ff"
  accentColor="#8b5cf6"
  gradient={["#ff0099", "#00ff99"]}
  speed={1.2}
  
  // Animation & Theme
  animationType="gradient-spin"
  customTheme="modern"
  darkMode={false}
  
  // Visual Effects
  glow={true}
  glowIntensity={0.6}
  shadow="0 0 32px 0 rgba(99, 102, 241, 0.3)"
  rounded={true}
  
  // Advanced Effects
  glassmorphism={false}
  neumorphism={false}
  vibrantColors={false}
  colorShift={false}
  breathingEffect={false}
  magneticEffect={false}
  scaleEffect={true}
  
  // Interactions
  microInteractions={true}
  hoverEffects={true}
  smoothTransitions={true}
  floatingStyle={true}
  
  // Content
  message="Loading amazing content..."
  showLoadingText={true}
  showPercentage={true}
  progress={50}
  icon={<MyIcon />}
  
  // Info Display
  showRetries={true}
  retries={2}
  showNetworkInfo={true}
  
  // Backdrop
  backdrop={true}
  backdropOpacity={0.7}
  blurBackground={true}
  
  // Behavior
  autoHideDelay={0}
  fadeInDuration={800}
  pulseEffect={false}
  
  // Accessibility
  accessibility={true}
  reducedMotion={false}
  highContrast={false}
  
  // Particles (for particle animations)
  particleCount={6}
  
  // Typography
  font="'Inter', sans-serif"
  
  // Custom styling
  customStyle={{}}
  labels={{
    loadingLabel: "Loading",
    retryLabel: "Retry",
    speedLabel: "Network Speed"
  }}
/>
```