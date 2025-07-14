
# React Dynamic Retry Loader

[![npm version](https://badge.fury.io/js/react-lazy-loader-js.svg)](https://badge.fury.io/js/react-lazy-loader-js)

`react-lazy-loader-js` is a highly flexible, production-grade loader for dynamically importing React components. It features robust retry logic, advanced caching, circuit breaker support, prefetching, priority and batch loading, SSR/SSG compatibility, context-based configuration, theme and animation registries, accessibility, and much more. Designed for both enterprise and open source projects, it gives you full control over how your components are loaded, retried, and displayed.

---

## 🚀 Features

- **Dynamic Retry Logic**: Smart, customizable retry strategies (exponential, linear, custom) for failed imports.
- **Advanced Caching**: LFU, LRU, memory, localStorage, IndexedDB, or custom cache support.
- **Circuit Breaker**: Prevents excessive retries and protects your app from repeated failures.
- **Prefetching & Priority Loading**: Prefetch on hover, idle, visible, or immediately; batch and prioritize loads.
- **Context & Global Config**: Set global defaults for all loaders using React context.
- **SSR/SSG & Suspense-less**: Works seamlessly with server-side rendering and can operate without React.Suspense.
- **Theme & Animation Registry**: Register and use custom themes and loader animations globally.
- **Multi-Stage Loading**: Skeleton → spinner → content, with full control over each stage.
- **Error Boundaries & Recovery**: Custom error fallback, retry, and progressive enhancement/fallback strategies.
- **Accessibility (A11y)**: ARIA roles, labels, and screen reader support out of the box.
- **Telemetry & Logging**: Hook into loader events for analytics, monitoring, or debugging.
- **Remote/CDN Import**: Support for loading modules from remote or CDN sources.
- **Test/Mock API**: Easily mock dynamic imports for testing environments.
- **Batching & Concurrency**: Control the number of concurrent loads and queue the rest.
- **Progressive Enhancement**: Fallback to static or simpler components if dynamic import fails or is unsupported.

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

### Basic Usage

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

### Advanced Usage with LazyLoader Component

```tsx
import React from 'react';
import { LazyLoader } from 'react-lazy-loader-js';

function App() {
  return (
    <LazyLoader
      importFunction={() => import('./MyComponent')}
      options={{
        retry: {
          maxCount: 3,
          strategy: 'exponential',
          baseDelay: 1000,
        },
        loader: {
          theme: 'dark',
          animation: 'pulse',
          size: 'medium',
        },
        cache: {
          type: 'lfu',
          maxAge: 3600000, // 1 hour
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
      maxCount: 5,
      strategy: 'exponential',
      baseDelay: 1000,
      maxDelay: 10000,
    },
    cache: {
      type: 'lfu',
      maxSize: 100,
      maxAge: 3600000,
    },
    loader: {
      theme: 'light',
      animation: 'wave',
      size: 'large',
      text: 'Loading component...',
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
        retry: {
          maxCount: 3,
          strategy: 'linear',
          baseDelay: 500,
        },
        loader: {
          theme: 'dark',
          animation: 'spin',
          size: 'medium',
          text: 'Loading user profile...',
        },
        cache: {
          type: 'memory',
          maxSize: 50,
        },
        errorFallback: (error, retry) => (
          <div>
            <p>Failed to load: {error.message}</p>
            <button onClick={retry}>Retry</button>
          </div>
        ),
      }}
    />
  );
}
```

### Configuration Options

#### Retry Configuration

```tsx
retry: {
  maxCount: 3,                    // Maximum number of retry attempts
  strategy: 'exponential',        // 'exponential', 'linear', 'custom'
  baseDelay: 1000,               // Base delay in milliseconds
  maxDelay: 10000,               // Maximum delay in milliseconds
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
  animation: 'spin',             // 'spin', 'pulse', 'wave', 'bounce', 'custom'
  size: 'medium',                // 'small', 'medium', 'large', 'custom'
  text: 'Loading...',            // Loading text
  showText: true,                // Whether to show loading text
  className: 'custom-loader',    // Custom CSS class
  style: { color: 'blue' },      // Custom inline styles
  glow: true,                    // Enable glow effect
  pulse: true,                   // Enable pulse effect
  gradient: true,                // Enable gradient effect
  customAnimation: MyAnimation,  // Custom animation component
}
```

#### Cache Configuration

```tsx
cache: {
  type: 'lfu',                   // 'lfu', 'lru', 'memory', 'localStorage', 'indexedDB', 'custom'
  maxSize: 100,                  // Maximum number of cached items
  maxAge: 3600000,               // Maximum age in milliseconds
  keyGenerator: (importFn) => '', // Custom cache key generator
  storage: customStorage,        // Custom storage implementation
  onHit: (key) => {},            // Callback on cache hit
  onMiss: (key) => {},           // Callback on cache miss
  onEvict: (key, value) => {},   // Callback on cache eviction
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
    maxCount: 3,
    strategy: 'exponential',
    baseDelay: 1000,
  },
  loader: {
    theme: 'dark',
    animation: 'wave',
    size: 'medium',
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
    loader: {
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
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      recoveryTimeout: 30000,
      onOpen: () => console.log('Circuit breaker opened'),
      onClose: () => console.log('Circuit breaker closed'),
    },
  }}
/>
```

#### Batching and Concurrency

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    batching: {
      enabled: true,
      maxConcurrent: 3,
      batchSize: 5,
      delay: 100,
    },
  }}
/>
```

#### Remote/CDN Import

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    importFrom: {
      type: 'cdn',
      baseUrl: 'https://cdn.example.com',
      fallback: 'local',
    },
  }}
/>
```

#### Mock/Test API

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    mock: {
      enabled: process.env.NODE_ENV === 'test',
      mockImport: async () => ({
        default: () => <div>Mocked Component</div>,
      }),
      delay: 100, // Simulate loading delay
    },
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
      maxCount: 3,
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
    progressive: {
      enabled: true,
      fallback: <StaticComponent />,
      strategy: 'graceful-degradation',
    },
  }}
/>
```

### Performance Optimization

#### Memory Management

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    memory: {
      cleanup: true,
      maxAge: 300000, // 5 minutes
      onCleanup: (key) => console.log('Cleaned up:', key),
    },
  }}
/>
```

#### Network Optimization

```tsx
<LazyLoader
  importFunction={() => import('./MyComponent')}
  options={{
    network: {
      adaptive: true,
      speedThreshold: 1000, // 1Mbps
      compression: true,
      preload: 'metadata',
    },
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
    text: 'custom-loader-text',
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
    maxCount: 3,
    strategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    onRetry: (attempt, error) => {},
    shouldRetry: (error) => true,
  },

  // Loader configuration
  loader: {
    theme: 'light',
    animation: 'spin',
    size: 'medium',
    text: 'Loading...',
    showText: true,
    className: '',
    style: {},
    glow: true,
    pulse: true,
    gradient: true,
    customAnimation: null,
    multiStage: {
      skeleton: null,
      delay: 0,
      transition: 'fade',
    },
  },

  // Cache configuration
  cache: {
    type: 'lfu',
    maxSize: 100,
    maxAge: 3600000,
    keyGenerator: null,
    storage: null,
    onHit: null,
    onMiss: null,
    onEvict: null,
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
    failureThreshold: 5,
    recoveryTimeout: 30000,
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
        retry: { maxCount: 2 },
        errorFallback: (error, retry) => (
          <button onClick={retry}>Retry</button>
        ),
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
cache: { type: 'lfu', maxSize: 50 }

// For large components with limited memory
cache: { type: 'lru', maxSize: 20 }

// For persistent caching
cache: { type: 'localStorage', maxAge: 86400000 }
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
  failureThreshold: 3,
  recoveryTimeout: 60000,
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
  maxCount: 3,
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