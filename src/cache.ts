export const cacheComponent = (url: string, component: any) => {
    localStorage.setItem(url, JSON.stringify(component));
  };
  
  export const getCachedComponent = (url: string) => {
    const cachedComponent = localStorage.getItem(url);
    return cachedComponent ? JSON.parse(cachedComponent) : null;
  }; 