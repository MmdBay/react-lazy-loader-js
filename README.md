
# React Dynamic Retry Loader

[![npm version](https://badge.fury.io/js/react-lazy-loader-js.svg)](https://badge.fury.io/js/react-lazy-loader-js)

`react-lazy-loader-js` is a smart loader for dynamically imported React components with retry, caching, and priority loading mechanisms. It provides features like dynamic retries, caching of loaded components, circuit breaker logic, prefetching, and priority loading to optimize the loading of React components in your app. You can also adjust the retry logic based on the user's internet speed and connection type.

## 🔥 Features

- **Dynamic Retry Logic**: Automatically retries loading React components if the import fails due to network issues or other errors. Adjust the retry count and delay based on the user's network quality.
- **Caching**: Caches successfully loaded components to speed up future loads using an LFU (Least Frequently Used) caching mechanism.
- **Circuit Breaker**: Prevents excessive retries by implementing a circuit breaker pattern, stopping retries after a configurable threshold and resetting after a set time.
- **Prefetching**: Prefetch components before they are needed to improve the user experience.
- **Priority Loading**: Load less important components with a delay while prioritizing critical components.
- **Customizable Loader**: Display retries, show network info, and style the loader however you want.

## Installation

You can install the package using npm or yarn:

```bash
npm install react-lazy-loader-js
```

# Usage

## 🆕 New in Version 1.1.0: Customizable Loader
#### You asked for it, and here it is—a fully customizable loader that shows retry counts, network speed, and lets you style it your way.

### 🚀 How to Use the Custom Loader:
Example with Custom Loader Configuration:

```typescript
import { retryDynamicImport, LazyLoader } from 'react-lazy-loader-js';

const LazyComponent = retryDynamicImport(() => import('./MyComponent'));

function App() {
  const configLoader = {
    size: 60, // Size of the spinner in pixels
    borderSize: 5, // Border thickness of the loader
    color: 'blue', // Loader color
    speed: 2, // Speed of the spinner in seconds
    showRetries: true, // Show retry count below the loader
    showNetworkInfo: true, // Show network speed info inside the loader
    customStyle: { backgroundColor: 'rgba(255, 255, 255, 0.8)' } // Custom background styling
  };
  
  return (
    <div>
      <LazyLoader LazyComponent={LazyComponent} loaderConfig={configLoader} retryCount={0} />
    </div>
  );
}

export default App;
```
Loader Configuration Options:

- size: The size of the loader spinner (in pixels).
- borderSize: Thickness of the loader’s border.
- color: Color of the loader’s border.
- speed: Speed of rotation (in seconds).
- showRetries: Boolean that enables/disables showing retry attempts below the loader.
- showNetworkInfo: Boolean to show/hide network speed and connection type inside the loader.
- customStyle: Add your own custom styles to the loader container (e.g., background color).


The package provides three main utilities: `retryDynamicImport`, `prefetchDynamicImport`, and `priorityLoadComponent`.

### 1. retryDynamicImport

This function allows you to dynamically import a React component with retry logic, caching, and circuit breaker functionality. It also adjusts retry logic based on the user's network speed and connection type.

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

Use `priorityLoadComponent` to load less important components after a delay, giving higher priority to critical components.

```typescript
import { priorityLoadComponent } from 'react-lazy-loader-js';

// Delay the loading of a component with a priority value (in seconds)
priorityLoadComponent(() => import('./LowPriorityComponent'), 5);
```

# Configuration

`retryDynamicImport` supports configuration through an optional second parameter. You can customize the retry behavior, timeout, circuit breaker settings, and network-based adjustments.

### Default Configuration

```typescript
const defaultConfig = {
  maxRetryCount: 5,                // Max retry attempts
  initialRetryDelayMs: 500,         // Initial delay between retries (in milliseconds)
  maxRetryDelayMs: 5000,            // Maximum delay between retries
  timeoutMs: 10000,                 // Timeout for loading a component
  circuitBreakerThreshold: 3,       // Max consecutive failures before circuit breaker activates
  resetTimeMs: 30000,               // Circuit breaker reset time (in milliseconds)
  // Network-based adjustments
  adjustForNetwork: true            // Adjust retry logic based on network speed and type
};
```

### Example with Custom Configuration

You can override the default configuration with your custom settings:

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
    resetTimeMs: 60000,
    adjustForNetwork: false  // Disable network-based adjustments
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

### Network-Based Adjustments

By default, `retryDynamicImport` adjusts its retry behavior based on the user's internet connection type and speed using the Network Information API. This allows for smarter retry logic, such as increasing retry attempts or delay when the connection is slow (e.g., on 2G or slow 3G networks).

- **Effective Network Type**: The library checks the user's network type (e.g., 2G, 3G, 4G, etc.).
- **Downlink Speed**: If the download speed is too low, the retry delay and count are automatically adjusted.

If you want to disable this feature, set `adjustForNetwork` to `false` in the configuration.

```typescript
const customConfig = {
  adjustForNetwork: false // Disable network-based adjustments
};
```

# How It Works

- **Retries on Failure**: If a component fails to load due to a network issue, the function retries based on the configured `maxRetryCount`. The retry delay increases exponentially to avoid overloading the network or server.
- **Caching**: Successfully loaded components are cached in-memory using an LFU (Least Frequently Used) cache mechanism, so the next time the component is needed, it loads instantly from the cache.
- **Circuit Breaker**: If the component fails to load after a certain number of retries, the circuit breaker prevents further retries for a configured amount of time (`resetTimeMs`).
- **Prefetching**: You can prefetch components to improve loading times for users when they navigate to that part of the app.
- **Priority Loading**: Load less critical components after a delay, prioritizing essential components first.

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

Copyright (c) 2024 Mmd Bay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
