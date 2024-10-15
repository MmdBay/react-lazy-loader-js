export const handleFailureWithCircuitBreaker = (
    retryCount: number,
    { circuitBreakerThreshold, resetTimeMs }: { circuitBreakerThreshold: number, resetTimeMs: number }
  ) => {
    if (retryCount >= circuitBreakerThreshold) {
      setTimeout(() => retryCount = 0, resetTimeMs);
      return true;
    }
    return false;
  };