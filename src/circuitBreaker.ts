import { RetryConfig } from './config';

export class CircuitBreaker {
  private retryCount: number = 0;
  private isOpen: boolean = false;
  private isHalfOpen: boolean = false;
  private successThreshold: number;
  private failureThreshold: number;
  private resetTimeout: number;

  constructor(config: RetryConfig) {
    this.failureThreshold = config.circuitBreakerThreshold;
    this.resetTimeout = config.resetTimeMs;
    this.successThreshold = 2;  // The number of successful attempts required to return to normal
  }

  /**
   * Handle failure logic with circuit breaker
   * If retryCount exceeds the failureThreshold, circuit breaker opens.
   */
  public handleFailure(): boolean {
    if (this.isOpen) {
      console.log("Circuit breaker is open, rejecting further attempts.");
      return true;
    }

    this.retryCount += 1;
    console.log(`Failure detected, retry count: ${this.retryCount}`);

    if (this.retryCount >= this.failureThreshold) {
      this.openCircuit();
      return true;
    }

    return false;
  }

  /**
   * Handle success and attempt to close the circuit breaker if in half-open state.
   */
  public handleSuccess(): void {
    if (this.isHalfOpen) {
      this.retryCount = 0;  // Reset failure count if success during half-open state
      console.log(`Success detected in half-open state, retry count reset to 0.`);

      this.successThreshold -= 1;
      if (this.successThreshold <= 0) {
        this.closeCircuit();
        console.log("Circuit breaker is now closed after successful attempts.");
      }
    }
  }

  /**
   * Open the circuit breaker and set a timer to move to half-open state.
   */
  private openCircuit(): void {
    console.log("Circuit breaker is now open.");
    this.isOpen = true;
    setTimeout(() => {
      this.isOpen = false;
      this.isHalfOpen = true;
      console.log("Circuit breaker is now half-open, testing for stability.");
    }, this.resetTimeout);
  }

  /**
   * Close the circuit breaker fully after successful operations.
   */
  private closeCircuit(): void {
    this.isHalfOpen = false;
    this.isOpen = false;
    this.retryCount = 0;
    console.log("Circuit breaker is now fully closed and operational.");
  }

  /**
   * Check if the circuit breaker is open.
   */
  public isCircuitOpen(): boolean {
    return this.isOpen;
  }
}
