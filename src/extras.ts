import React, { useCallback, useRef } from 'react';

/**
 * Simple telemetry hook for logging loader-related events.
 * The implementation is intentionally lightweight – it just stores
 * the events in a ref so the caller can later inspect them via
 * `getMetrics`. It’s mainly provided so the public API surface
 * matches the README examples.
 */
export function useLoaderTelemetry() {
  // Holds a list of events { event, data, timestamp }
  const eventsRef = useRef<{ event: string; data?: any; timestamp: number }[]>([]);

  /**
   * Push a telemetry event to the in-memory buffer.
   */
  const logEvent = useCallback((event: string, data?: any) => {
    eventsRef.current.push({ event, data, timestamp: Date.now() });
  }, []);

  /**
   * Retrieve the buffered events. Callers get a shallow copy so they
   * don’t mutate our internal state accidentally.
   */
  const getMetrics = useCallback(() => eventsRef.current.slice(), []);

  return { logEvent, getMetrics };
}

// ---------------------------------------------------------------------------------
// Theme registry helpers
// ---------------------------------------------------------------------------------

export interface LoaderThemeDefinition {
  name: string;
  colors?: Record<string, string>;
  styles?: Record<string, string>;
  // Additional user-defined fields are allowed.
  [key: string]: any;
}

const themeRegistry: Record<string, LoaderThemeDefinition> = {};

/**
 * Register a custom loader theme so it can be referenced by name.
 */
export function registerLoaderTheme(theme: LoaderThemeDefinition) {
  if (!theme || !theme.name) {
    throw new Error('registerLoaderTheme: theme must have a unique "name" field');
  }
  themeRegistry[theme.name] = theme;
}

/**
 * Retrieve a registered theme by name.
 */
export function getRegisteredLoaderTheme(name: string) {
  return themeRegistry[name];
}

// ---------------------------------------------------------------------------------
// Animation registry helpers
// ---------------------------------------------------------------------------------

export type LoaderAnimationComponent = React.FC<any>;

const animationRegistry: Record<string, LoaderAnimationComponent> = {};

/**
 * Register a custom animation component under a key.
 */
export function registerLoaderAnimation(key: string, component: LoaderAnimationComponent) {
  if (!key) throw new Error('registerLoaderAnimation: key is required');
  animationRegistry[key] = component;
}

/**
 * Fetch a registered animation component.
 */
export function getRegisteredLoaderAnimation(key: string): LoaderAnimationComponent | undefined {
  return animationRegistry[key];
}

// ---------------------------------------------------------------------------------
// Custom cache helper
// ---------------------------------------------------------------------------------

export interface CustomCache<K = any, V = any> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V, options?: any) => void;
  delete: (key: K) => void;
  clear: () => void;
}

/**
 * Thin helper that simply returns the user-supplied implementation. It exists
 * so consumers can provide their own cache object but still use a strongly‐typed
 * factory consistent with the README.
 */
export function createCustomCache<K = any, V = any>(impl: CustomCache<K, V>): CustomCache<K, V> {
  return impl;
}

// ---------------------------------------------------------------------------------
// Error boundary component
// ---------------------------------------------------------------------------------

interface LazyLoaderErrorBoundaryProps {
  /**
   * Fallback render prop called with the thrown error and a `retry` callback.
   */
  fallback: (error: Error, retry: () => void) => React.ReactNode;
  children: React.ReactNode;
}

interface LazyLoaderErrorBoundaryState {
  error: Error | null;
}

/**
 * A very small ErrorBoundary that matches the README API. It re-renders the
 * fallback when an error occurs and exposes a retry callback that resets the
 * internal error state so the children can attempt to render again.
 */
export class LazyLoaderErrorBoundary extends React.Component<
  LazyLoaderErrorBoundaryProps,
  LazyLoaderErrorBoundaryState
> {
  constructor(props: LazyLoaderErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error: Error): LazyLoaderErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('LazyLoaderErrorBoundary caught error:', error, info);
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
}

// The file acts as a central opt-in hub for optional/custom utilities. Nothing else needed. 