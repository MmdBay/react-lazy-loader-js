import { CircuitBreaker } from '../circuitBreaker';
import { getConfig } from '../config';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.log to avoid cluttering test output
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const config = getConfig({
      circuitBreakerThreshold: 3,
      resetTimeMs: 1000 // 1 second for faster tests
    });
    circuitBreaker = new CircuitBreaker(config);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Closed State (Normal Operation)', () => {
    test('should start in closed state', () => {
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
    });

    test('should allow operations when closed', () => {
      const shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(false);
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
    });

    test('should track failures without opening immediately', () => {
      // Fail once
      let shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(false);
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      // Fail twice
      shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(false);
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
    });
  });

  describe('Open State (Circuit Breaker Triggered)', () => {
    beforeEach(() => {
      // Trigger circuit breaker by failing threshold times
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
    });

    test('should open circuit after threshold failures', () => {
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
    });

    test('should reject all attempts when open', () => {
      const shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(true);
    });

    test('should transition to half-open after reset time', (done) => {
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
      
      setTimeout(() => {
        // Circuit should now be half-open (not fully open)
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        done();
      }, 1100); // Wait slightly longer than reset time
    });
  });

  describe('Half-Open State (Testing Recovery)', () => {
    beforeEach((done) => {
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
      
      // Wait for transition to half-open
      setTimeout(() => {
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        done();
      }, 1100);
    });

    test('should close circuit after successful operations', () => {
      // Simulate 2 successful operations (successThreshold = 2)
      circuitBreaker.handleSuccess();
      circuitBreaker.handleSuccess();
      
      // Circuit should now be fully closed
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      // Should allow operations without triggering immediately
      const shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(false);
    });

    test('should handle mixed success and failure in half-open', () => {
      // One success
      circuitBreaker.handleSuccess();
      
      // Then a failure - should reopen circuit
      const shouldReject = circuitBreaker.handleFailure();
      expect(shouldReject).toBe(false); // First failure in half-open is allowed
      
      // But multiple failures should trigger again
      for (let i = 0; i < 2; i++) {
        circuitBreaker.handleFailure();
      }
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
    });

    test('should reset retry count on success in half-open state', () => {
      // Have one success
      circuitBreaker.handleSuccess();
      
      // Then fail - should start counting from 0 again
      circuitBreaker.handleFailure();
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      // Should need threshold failures to open again
      circuitBreaker.handleFailure();
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      circuitBreaker.handleFailure();
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
    });
  });

  describe('Configuration Options', () => {
    test('should respect custom failure threshold', () => {
      const customConfig = getConfig({
        circuitBreakerThreshold: 5,
        resetTimeMs: 1000
      });
      const customCircuitBreaker = new CircuitBreaker(customConfig);
      
      // Should not open until 5 failures
      for (let i = 0; i < 4; i++) {
        const shouldReject = customCircuitBreaker.handleFailure();
        expect(shouldReject).toBe(false);
        expect(customCircuitBreaker.isCircuitOpen()).toBe(false);
      }
      
      // 5th failure should open it
      const shouldReject = customCircuitBreaker.handleFailure();
      expect(shouldReject).toBe(true);
      expect(customCircuitBreaker.isCircuitOpen()).toBe(true);
    });

    test('should respect custom reset time', (done) => {
      const customConfig = getConfig({
        circuitBreakerThreshold: 2,
        resetTimeMs: 500 // Shorter reset time
      });
      const customCircuitBreaker = new CircuitBreaker(customConfig);
      
      // Open the circuit
      customCircuitBreaker.handleFailure();
      customCircuitBreaker.handleFailure();
      expect(customCircuitBreaker.isCircuitOpen()).toBe(true);
      
      // Should transition to half-open after custom reset time
      setTimeout(() => {
        expect(customCircuitBreaker.isCircuitOpen()).toBe(false);
        done();
      }, 600);
    });
  });

  describe('Edge Cases', () => {
    test('should handle success calls when circuit is closed', () => {
      // Success in closed state should do nothing
      circuitBreaker.handleSuccess();
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      // Should still track failures normally
      circuitBreaker.handleFailure();
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
    });

    test('should handle zero threshold configuration', () => {
      const zeroThresholdConfig = getConfig({
        circuitBreakerThreshold: 0,
        resetTimeMs: 1000
      });
      const zeroCircuitBreaker = new CircuitBreaker(zeroThresholdConfig);
      
      // Should open immediately on any failure
      const shouldReject = zeroCircuitBreaker.handleFailure();
      expect(shouldReject).toBe(true);
      expect(zeroCircuitBreaker.isCircuitOpen()).toBe(true);
    });

    test('should handle rapid successive failures', () => {
      // Multiple rapid failures
      for (let i = 0; i < 10; i++) {
        circuitBreaker.handleFailure();
      }
      
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
    });

    test('should handle rapid successive successes in half-open', (done) => {
      // Open circuit first
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
      
      setTimeout(() => {
        // Multiple rapid successes
        for (let i = 0; i < 5; i++) {
          circuitBreaker.handleSuccess();
        }
        
        // Should be closed after sufficient successes
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        done();
      }, 1100);
    });
  });

  describe('State Transitions', () => {
    test('should complete full cycle: closed -> open -> half-open -> closed', (done) => {
      // Start closed
      expect(circuitBreaker.isCircuitOpen()).toBe(false);
      
      // Transition to open
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
      
      // Transition to half-open
      setTimeout(() => {
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        
        // Transition back to closed
        circuitBreaker.handleSuccess();
        circuitBreaker.handleSuccess();
        
        // Verify it's working normally again
        const shouldReject = circuitBreaker.handleFailure();
        expect(shouldReject).toBe(false);
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        
        done();
      }, 1100);
    });

    test('should handle open -> half-open -> open -> half-open cycle', (done) => {
      // Open circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
      expect(circuitBreaker.isCircuitOpen()).toBe(true);
      
      setTimeout(() => {
        // Now half-open
        expect(circuitBreaker.isCircuitOpen()).toBe(false);
        
        // Fail again to reopen
        for (let i = 0; i < 3; i++) {
          circuitBreaker.handleFailure();
        }
        expect(circuitBreaker.isCircuitOpen()).toBe(true);
        
        // Wait for second half-open transition
        setTimeout(() => {
          expect(circuitBreaker.isCircuitOpen()).toBe(false);
          done();
        }, 1100);
        
      }, 1100);
    });
  });

  describe('Logging Behavior', () => {
    test('should log appropriate messages for state transitions', (done) => {
      // Open circuit
      circuitBreaker.handleFailure();
      circuitBreaker.handleFailure();
      circuitBreaker.handleFailure();
      
      expect(consoleSpy).toHaveBeenCalledWith('Circuit breaker is now open.');
      
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Circuit breaker is now half-open, testing for stability.');
        
        // Close circuit
        circuitBreaker.handleSuccess();
        circuitBreaker.handleSuccess();
        
        expect(consoleSpy).toHaveBeenCalledWith('Circuit breaker is now closed after successful attempts.');
        expect(consoleSpy).toHaveBeenCalledWith('Circuit breaker is now fully closed and operational.');
        
        done();
      }, 1100);
    });

    test('should log failure count increments', () => {
      circuitBreaker.handleFailure();
      expect(consoleSpy).toHaveBeenCalledWith('Failure detected, retry count: 1');
      
      circuitBreaker.handleFailure();
      expect(consoleSpy).toHaveBeenCalledWith('Failure detected, retry count: 2');
    });

    test('should log rejection messages when circuit is open', () => {
      // Open circuit
      for (let i = 0; i < 3; i++) {
        circuitBreaker.handleFailure();
      }
      
      // Try to use when open
      circuitBreaker.handleFailure();
      expect(consoleSpy).toHaveBeenCalledWith('Circuit breaker is open, rejecting further attempts.');
    });
  });
});
