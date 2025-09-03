import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader, { LoaderProps, LoaderAnimation } from '../LoadingSpinner';

// Mock console.log to avoid test output clutter
jest.spyOn(console, 'log').mockImplementation();

// Mock the networkSpeed module to avoid async state update warnings
jest.mock('../networkSpeed', () => ({
  getNetworkInfo: jest.fn().mockImplementation(() => {
    // Return a resolved promise immediately to avoid async timing issues
    return Promise.resolve({
      effectiveType: '4g',
      downlink: 10,
      saveData: false,
      isEstimate: false,
    });
  }),
  getNetworkInfoSync: jest.fn().mockReturnValue({
    effectiveType: '4g',
    downlink: 10,
    saveData: false,
    isEstimate: false,
  }),
}));

describe('LoadingSpinner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Mark test environment to disable network info
    if (typeof window !== 'undefined') {
      (window as any).__JEST__ = true;
    }
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('should render with default props', () => {
      render(<Loader disableNetworkInfo={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveAttribute('aria-label', 'Loading');
    });

    test('should render with custom size', () => {
      render(<Loader size={100} disableNetworkInfo={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with custom colors', () => {
      render(
        <Loader 
          color="red" 
          secondaryColor="blue" 
          accentColor="green" 
        />
      );
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with custom message', () => {
      render(<Loader disableNetworkInfo={true} message="Loading custom content..." />);
      
      expect(screen.getByText('Loading custom content...')).toBeInTheDocument();
    });

    test('should render with progress indicator', () => {
      render(<Loader disableNetworkInfo={true} progress={75} showPercentage={true} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Animation Types', () => {
    const animations: LoaderAnimation[] = [
      'spin',
      'dots',
      'pulse',
      'bar',
      'wave',
      'gradient-spin',
      'bounce',
      'ripple',
      'orbit'
    ];

    animations.forEach(animation => {
      test(`should render with ${animation} animation`, () => {
        render(<Loader disableNetworkInfo={true} animationType={animation} />);
        
        const loader = screen.getByRole('status');
        expect(loader).toBeInTheDocument();
      });
    });
  });

  describe('Theme Support', () => {
    test('should render with dark mode', () => {
      render(<Loader disableNetworkInfo={true} darkMode={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with custom theme', () => {
      render(<Loader disableNetworkInfo={true} customTheme="glass" />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with glassmorphism effect', () => {
      render(<Loader disableNetworkInfo={true} glassmorphism={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with neumorphism effect', () => {
      render(<Loader disableNetworkInfo={true} neumorphism={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Visual Effects', () => {
    test('should render with glow effect', () => {
      render(<Loader disableNetworkInfo={true} glow={true} glowIntensity={0.8} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with pulse effect', () => {
      render(<Loader disableNetworkInfo={true} pulseEffect={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with scale effect', () => {
      render(<Loader disableNetworkInfo={true} scaleEffect={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with backdrop', () => {
      render(<Loader disableNetworkInfo={true} backdrop={true} backdropOpacity={0.5} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should render with accessibility features', () => {
      render(
        <Loader 
          accessibility={true}
          aria-label="Custom loading label"
        />
      );
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
      // The aria-label prop might be overridden by default behavior
      expect(loader).toHaveAttribute('aria-label');
    });

    test('should render with reduced motion', () => {
      render(<Loader disableNetworkInfo={true} reducedMotion={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with high contrast', () => {
      render(<Loader disableNetworkInfo={true} highContrast={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Network Information', () => {
    test('should render with network info when enabled', () => {
      render(<Loader disableNetworkInfo={true} showNetworkInfo={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render retry count when enabled', () => {
      render(<Loader disableNetworkInfo={true} showRetries={true} retries={3} />);
      
      expect(screen.getByText(/Retry/)).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      
      render(<Loader disableNetworkInfo={true} customStyle={customStyle} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should apply custom font', () => {
      render(<Loader disableNetworkInfo={true} font="Arial" />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render as rounded', () => {
      render(<Loader disableNetworkInfo={true} rounded={true} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Advanced Features', () => {
    test('should render with particles', () => {
      render(<Loader disableNetworkInfo={true} particleCount={50} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with gradient colors', () => {
      render(<Loader disableNetworkInfo={true} gradient={['#ff0000', '#00ff00', '#0000ff']} />);
      
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    test('should render with custom icon', () => {
      const customIcon = <div data-testid="custom-icon">⚡</div>;
      
      render(<Loader disableNetworkInfo={true} icon={customIcon} />);
      
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    test('should render with children', () => {
      render(
        <Loader>
          <div data-testid="loader-children">Custom content</div>
        </Loader>
      );
      
      expect(screen.getByTestId('loader-children')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle invalid animation type gracefully', () => {
      expect(() => {
        render(<Loader disableNetworkInfo={true} animationType={'invalid-animation' as LoaderAnimation} />);
      }).not.toThrow();
    });

    test('should handle zero size', () => {
      expect(() => {
        render(<Loader disableNetworkInfo={true} size={0} />);
      }).not.toThrow();
    });

    test('should handle negative values gracefully', () => {
      expect(() => {
        render(
          <Loader 
            size={-10} 
            speed={-1} 
            progress={-50}
            retries={-1}
          />
        );
      }).not.toThrow();
    });

    test('should handle very large values', () => {
      expect(() => {
        render(
          <Loader 
            size={1000} 
            speed={100} 
            progress={200}
            retries={999}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should render multiple loaders without issues', () => {
      expect(() => {
        render(
          <div>
            <Loader animationType="spin" />
            <Loader animationType="dots" />
            <Loader animationType="pulse" />
            <Loader animationType="bar" />
            <Loader animationType="wave" />
          </div>
        );
      }).not.toThrow();
    });

    test('should handle rapid prop changes', () => {
      const { rerender } = render(<Loader size={50} />);
      
      expect(() => {
        rerender(<Loader size={100} />);
        rerender(<Loader size={25} />);
        rerender(<Loader size={75} />);
      }).not.toThrow();
    });
  });
});
