import { RetryConfig } from './config'; // Bringing in the retry config, which tells us when to "break the circuit"

export class CircuitBreaker {
  // We’re keeping track of the number of failed retries (`retryCount`), 
  // whether the circuit is open (stopped trying) or half-open (kinda testing things out).
  private retryCount: number = 0;
  private isOpen: boolean = false; // When this is true, we stop making any attempts
  private isHalfOpen: boolean = false; // Half-open means we're testing if things are back to normal
  private successThreshold: number; // How many successes we need before we're fully back in action
  private failureThreshold: number; // How many fails we can take before saying, "Enough!"
  private resetTimeout: number; // How long we wait before trying again after breaking the circuit

  constructor(config: RetryConfig) {
    // We grab the failure limit and reset time from the config.
    this.failureThreshold = config.circuitBreakerThreshold;
    this.resetTimeout = config.resetTimeMs;
    this.successThreshold = 2;  // We need two successful attempts to close the circuit.
  }

  /**
   * This is the part where we handle failures.
   * If the number of retries is more than the failureThreshold, we "open" the circuit, 
   * which basically means we stop making further attempts for a while.
   */
  public handleFailure(): boolean {
    if (this.isOpen) { // If the circuit is already open, we don’t bother trying again
      console.log("Circuit breaker is open, rejecting further attempts.");
      return true;
    }

    this.retryCount += 1; // Add one to the retry count every time we fail
    console.log(`Failure detected, retry count: ${this.retryCount}`);

    if (this.retryCount >= this.failureThreshold) { // If we fail too many times, we break the circuit
      this.openCircuit();
      return true; // Circuit is open, no more retries
    }

    return false; // Not enough fails yet, keep trying
  }

  /**
   * This handles successful attempts. If we're in the half-open state, 
   * we need to see a few successful retries before we can fully close the circuit and go back to normal.
   */
  public handleSuccess(): void {
    if (this.isHalfOpen) { // If we're testing the waters after being half-open...
      this.retryCount = 0;  // Reset the fail count since we’ve got a success
      console.log(`Success detected in half-open state, retry count reset to 0.`);

      this.successThreshold -= 1; // We need a couple of successes before closing the circuit
      if (this.successThreshold <= 0) {
        this.closeCircuit(); // After enough successes, close the circuit completely
        console.log("Circuit breaker is now closed after successful attempts.");
      }
    }
  }

  /**
   * When things go bad and we fail too many times, we "open" the circuit. 
   * This means we stop making further attempts for a bit and then move into the half-open state to test things.
   */
  private openCircuit(): void {
    console.log("Circuit breaker is now open.");
    this.isOpen = true; // Circuit is officially open (we're not trying anymore)
    setTimeout(() => {
      this.isOpen = false; // After the timeout, we move to half-open, to see if things have improved
      this.isHalfOpen = true;
      console.log("Circuit breaker is now half-open, testing for stability.");
    }, this.resetTimeout); // We'll wait for the resetTimeout before trying again
  }

  /**
   * If things go well, we can "close" the circuit, which means we're fully operational again.
   */
  private closeCircuit(): void {
    this.isHalfOpen = false; // We're no longer testing
    this.isOpen = false; // Circuit is fully closed, back to normal
    this.retryCount = 0; // Reset the fail count
    console.log("Circuit breaker is now fully closed and operational.");
  }

  /**
   * This is just a quick check to see if the circuit breaker is open.
   * If it is, we’re not making any new attempts.
   */
  public isCircuitOpen(): boolean {
    return this.isOpen;
  }
}
