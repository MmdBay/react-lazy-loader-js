# React Dynamic Retry Loader

[![npm version](https://badge.fury.io/js/react-lazy-loader-js.svg)](https://badge.fury.io/js/react-lazy-loader-js)

`react-lazy-loader-js` is a smart loader for dynamically imported React components with retry, caching, and priority loading mechanisms. It provides features like dynamic retries, caching of loaded components, circuit breaker logic, prefetching, and priority loading to optimize the loading of React components in your app.

## Features

- **Dynamic Retry Logic**: Automatically retries loading React components if the import fails due to network issues or other errors.
- **Caching**: Caches successfully loaded components to speed up future loads.
- **Circuit Breaker**: Prevents excessive retries by implementing a circuit breaker pattern, stopping retries after a configurable threshold.
- **Prefetching**: Prefetch components before they are needed to improve the user experience.
- **Priority Loading**: Load less important components with a delay while prioritizing critical components.

## Installation

You can install the package using npm or yarn:

```bash
npm install react-lazy-loader
```

# Usage
The package provides three main utilities: retryDynamicImport, prefetchDynamicImport, and priorityLoadComponent.

### 1. retryDynamicImport
This function allows you to dynamically import a React component with retry logic and caching.

```typescript
import { retryDynamicImport } from 'react-lazy-loader-js';

const LazyComponent = retryDynamicImport(() => import('./MyComponent'));

function App() {
  return (
    <div>
      <h1>My App</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </React.Suspense>
    </div>
  );
}

export default App;
```
### 2. prefetchDynamicImport
Use this function to prefetch components before they are needed, reducing the load time when the user navigates to that part of the app.

```typescript
import { prefetchDynamicImport } from 'react-lazy-loader-js';

// Prefetch a component
prefetchDynamicImport(() => import('./MyComponent'));

// You can call this function when you expect the user to navigate to that component soon
```

### 3. priorityLoadComponent
Use priorityLoadComponent to load less important components after a delay, giving higher priority to critical components.

```typescript
import { priorityLoadComponent } from 'react-lazy-loader-js';

// Delay the loading of a component with a priority value (in seconds)
priorityLoadComponent(() => import('./LowPriorityComponent'), 5);
```

# Configuration
retryDynamicImport supports configuration through an optional second parameter. You can customize the retry behavior, timeout, and circuit breaker settings.

Default Configuration

```typescript
const defaultConfig = {
  maxRetryCount: 5,              // Max retry attempts
  initialRetryDelayMs: 500,       // Initial delay between retries (in milliseconds)
  maxRetryDelayMs: 5000,          // Maximum delay between retries
  timeoutMs: 10000,               // Timeout for loading a component
  circuitBreakerThreshold: 3,     // Max consecutive failures before circuit breaker activates
  resetTimeMs: 30000              // Circuit breaker reset time (in milliseconds)
};
```

### Example with Custom Configuration

```typescript
import { retryDynamicImport } from 'react-lazy-loader-js';

const LazyComponent = retryDynamicImport(
  () => import('./MyComponent'),
  {
    maxRetryCount: 10,
    initialRetryDelayMs: 1000,
    maxRetryDelayMs: 10000,
    timeoutMs: 20000,
    circuitBreakerThreshold: 5,
    resetTimeMs: 60000
  }
);

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </React.Suspense>
  );
}

export default App;
```

# How It Works
Retries on Failure: When dynamically importing a React component, if the import fails due to a network issue or other reasons, the function will automatically retry up to the specified maxRetryCount.
Exponential Backoff: The time between retries increases exponentially to avoid overloading the server or network. This is adjustable via the configuration.
Caching: Successfully loaded components are cached in localStorage, so the next time the same component is needed, it is loaded instantly from the cache.
Circuit Breaker: If the import fails multiple times, the circuit breaker will stop further retries for a certain period, avoiding unnecessary retries and resource waste.
Prefetching: You can prefetch components when you anticipate they will be needed, allowing them to load faster when the user navigates to that part of the app.
Priority Loading: Components that are less critical can be loaded with a delay using priorityLoadComponent, ensuring that important components are prioritized.

# Examples
### Example with Prefetching

```typescript
import { retryDynamicImport, prefetchDynamicImport } from 'react-lazy-loader-js';

const LazyComponent = retryDynamicImport(() => import('./MyComponent'));

// Prefetch the component when the app starts
prefetchDynamicImport(() => import('./MyComponent'));

function App() {
  return (
    <div>
      <h1>My App</h1>
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </React.Suspense>
    </div>
  );
}

export default App;
```

### Example with Priority Loading

```typescript
import { retryDynamicImport, priorityLoadComponent } from 'react-lazy-loader-js';

// Higher priority component
const ImportantComponent = retryDynamicImport(() => import('./ImportantComponent'));

// Lower priority component (delayed by 5 seconds)
priorityLoadComponent(() => import('./LowPriorityComponent'), 5);

function App() {
  return (
    <div>
      <h1>My App</h1>
      <React.Suspense fallback={<div>Loading important component...</div>}>
        <ImportantComponent />
      </React.Suspense>
    </div>
  );
}

export default App;
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

### Key Sections in the README:
1. **Project Introduction**: Clear introduction about what the project does and its purpose.
2. **Installation**: Simple instructions for installation using npm or yarn.
3. **Usage**: Examples on how to use the package in real React apps with components.
4. **Configuration**: Information on how users can customize the retry, timeout, and circuit breaker behavior.
5. **How It Works**: A breakdown of how retries, caching, circuit breaker, and prefetching function within the library.
6. **Examples**: Practical examples that developers can copy and paste into their projects to quickly get started.

This README will make your library easy to understand and use by other developers when published to NPM.