import React from 'react';
import { retryDynamicImport } from './retry';
import { render, waitFor } from '@testing-library/react';

describe('retryDynamicImport', () => {
  it('should retry importing a component when import fails', async () => {
    const mockImport = jest.fn()
      .mockRejectedValueOnce(new Error('Failed to load'))
      .mockResolvedValueOnce({ default: () => <div>Loaded Component</div> });

    const LazyComponent = retryDynamicImport(mockImport);
    render(<React.Suspense fallback={<div>Loading...</div>}><LazyComponent /></React.Suspense>);
    await waitFor(() => expect(mockImport).toHaveBeenCalledTimes(2));
  });
});
