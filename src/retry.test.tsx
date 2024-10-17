import React from 'react';
import { retryDynamicImport } from './retry';
import { render, waitFor } from '@testing-library/react';

describe('retryDynamicImport', () => {
  it('should retry importing a component when import fails', async () => {
    const mockImport = jest.fn()
      .mockRejectedValueOnce(new Error('Failed to load')) // First attempt fails
      .mockResolvedValueOnce({ default: () => <div>Loaded Component</div> }); // Second attempt succeeds

    const LazyComponent = retryDynamicImport(mockImport, {
      maxRetryCount: 2, // Ensure retries happen
      initialRetryDelayMs: 100, // Reduce delay for faster retry
      maxRetryDelayMs: 200,
      timeoutMs: 5000, // Ensure test doesn't timeout too early
      circuitBreakerThreshold: 5,
      resetTimeMs: 3000,
    });

    render(<React.Suspense fallback={<div>Loading...</div>}><LazyComponent /></React.Suspense>);

    // Wait for retry and ensure mockImport is called twice
    await waitFor(() => expect(mockImport).toHaveBeenCalledTimes(2));
  });
});
