export const getRouteComponentUrl = (originalImport: () => Promise<any>): string | null => {
    try {
      const fnString = originalImport.toString();
      return fnString.match(/import\(["']([^)]+)['"]\)/)?.[1] || null;
    } catch {
      return null;
    }
  };
  
  export const getRetryImportFunction = (
    originalImport: () => Promise<any>,
    retryCount: number
  ): (() => Promise<any>) => {
    const importUrl = getRouteComponentUrl(originalImport);
    if (!importUrl || retryCount === 0) return originalImport;
  
    const importUrlWithVersionQuery = importUrl.includes('?')
      ? `${importUrl}&v=${retryCount}-${Math.random().toString(36).substring(2)}`
      : `${importUrl}?v=${retryCount}-${Math.random().toString(36).substring(2)}`;
  
    return () => import(importUrlWithVersionQuery);
  };