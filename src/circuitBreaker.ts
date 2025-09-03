import { RetryConfig } from './config';

export class CircuitBreaker {
  // Track the number of failed retries and circuit state
  private retryCount: number = 0;
  private isOpen: boolean = false; // True when circuit is open (no attempts allowed)
  private isHalfOpen: boolean = false; // True when testing if service is back to normal
  private successThreshold: number; // Number of successes needed to close the circuit
  private failureThreshold: number; // Number of failures before opening the circuit
  private resetTimeout: number; // Wait time before transitioning to half-open state

  constructor(config: RetryConfig) {
    // Initialize circuit breaker with configuration values
    this.failureThreshold = config.circuitBreakerThreshold;
    this.resetTimeout = config.resetTimeMs;
    this.successThreshold = 2; // Require two successful attempts to close the circuit
  }

  /**
   * Handle failure events and determine if the circuit should be opened.
   * If the failure threshold is exceeded, the circuit opens to prevent further attempts.
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
      return true; // Circuit is open, no more retries
    }

    return false; // Continue trying
  }

  /**
   * Handle successful attempts. In half-open state, successful attempts move us closer
   * to closing the circuit and returning to normal operation.
   */
  public handleSuccess(): void {
    if (this.isHalfOpen) {
      this.retryCount = 0; // Reset failure count on success
      console.log(`Success detected in half-open state, retry count reset to 0.`);

      this.successThreshold -= 1;
      if (this.successThreshold <= 0) {
        this.closeCircuit();
        console.log("Circuit breaker is now closed after successful attempts.");
      }
    }
  }

  /**
   * Open the circuit breaker after too many failures.
   * Sets a timeout to transition to half-open state for testing recovery.
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
   * Close the circuit breaker when service has recovered.
   * Returns to normal operational state.
   */
  private closeCircuit(): void {
    this.isHalfOpen = false;
    this.isOpen = false;
    this.retryCount = 0;
    console.log("Circuit breaker is now fully closed and operational.");
  }

  /**
   * Check if the circuit breaker is currently open (blocking attempts).
   */
  public isCircuitOpen(): boolean {
    return this.isOpen;
  }
}
