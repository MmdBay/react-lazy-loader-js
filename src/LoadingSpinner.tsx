import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { getNetworkInfo } from './networkSpeed';

// Enhanced animation types with more options
export type LoaderAnimation = 
  | 'spin' 
  | 'dots' 
  | 'wave' 
  | 'bar' 
  | 'pulse' 
  | 'ripple'
  | 'square' 
  | 'infinity'
  | 'cube'
  | 'spiral'
  | 'orbit'
  | 'bounce'
  | 'morph'
  | 'gradient-spin'
  | 'elastic'
  | 'flip'
  | 'scale'
  | 'particles'
  | 'neon';

export interface LoaderLabels {
  retryLabel?: string;
  speedLabel?: string;
  typeLabel?: string;
  saveDataLabel?: string;
  saveDataOn?: string;
  saveDataOff?: string;
  gettingLabel?: string;
  percentLabel?: (progress: number) => string;
  messageLabel?: string;
  loadingLabel?: string;
  completedLabel?: string;
  errorLabel?: string;
}

export interface LoaderProps {
  size?: number;
  borderSize?: number;
  color?: string;
  secondaryColor?: string;
  accentColor?: string;
  gradient?: string[]; // For multi-color/gradient
  speed?: number;
  retries?: number;
  showRetries?: boolean;
  showNetworkInfo?: boolean;
  // For testing purposes - disable network info updates
  disableNetworkInfo?: boolean;
  customStyle?: React.CSSProperties;
  shadow?: string;
  glow?: boolean;
  glowIntensity?: number;
  animationType?: LoaderAnimation;
  icon?: ReactNode;
  progress?: number; // 0-100, if you want to show progress
  message?: string;
  darkMode?: boolean;
  children?: ReactNode;
  labels?: LoaderLabels;
  blurBackground?: boolean;
  backdrop?: boolean;
  backdropOpacity?: number;
  font?: string;
  rounded?: boolean;
  floatingStyle?: boolean;
  pulseEffect?: boolean;
  
  // New advanced options
  glassmorphism?: boolean;
  neumorphism?: boolean;
  vibrantColors?: boolean;
  smoothTransitions?: boolean;
  microInteractions?: boolean;
  particleCount?: number;
  showLoadingText?: boolean;
  showPercentage?: boolean;
  audioFeedback?: boolean;
  hapticFeedback?: boolean;
  customTheme?: 'modern' | 'classic' | 'neon' | 'minimal' | 'gradient' | 'glass';
  autoHideDelay?: number;
  fadeInDuration?: number;
  scaleEffect?: boolean;
  rotationIntensity?: number;
  colorShift?: boolean;
  breathingEffect?: boolean;
  magneticEffect?: boolean;
  hoverEffects?: boolean;
  accessibility?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

const defaultLabels: LoaderLabels = {
  retryLabel: 'Retry',
  speedLabel: 'Network Speed',
  typeLabel: 'Connection',
  saveDataLabel: 'Data Saver',
  saveDataOn: 'On',
  saveDataOff: 'Off',
  gettingLabel: 'Calculating...',
  percentLabel: (progress) => `${progress}%`,
  messageLabel: '',
  loadingLabel: 'Loading',
  completedLabel: 'Completed',
  errorLabel: 'Error'
};

const Loader: React.FC<LoaderProps> = ({
  size = 80,
  borderSize = 6,
  color = '#6366f1',
  secondaryColor = '#e0e7ff',
  accentColor = '#8b5cf6',
  gradient,
  speed = 1.2,
  retries = 0,
  showRetries = true,
  showNetworkInfo = true,
  disableNetworkInfo = false,
  customStyle = {},
  shadow = '0 0 32px 0 rgba(99, 102, 241, 0.3)',
  glow = true,
  glowIntensity = 0.6,
  animationType = 'spin',
  icon,
  progress,
  message,
  darkMode = false,
  children,
  labels = {},
  blurBackground = true,
  backdrop = true,
  backdropOpacity = 0.7,
  font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  rounded = true,
  floatingStyle = true,
  pulseEffect = false,
  
  // New advanced options with defaults
  glassmorphism = false,
  neumorphism = false,
  vibrantColors = false,
  smoothTransitions = true,
  microInteractions = true,
  particleCount = 6,
  showLoadingText = true,
  showPercentage = true,
  audioFeedback = false,
  hapticFeedback = false,
  customTheme = 'modern',
  autoHideDelay = 0,
  fadeInDuration = 800,
  scaleEffect = true,
  rotationIntensity = 1,
  colorShift = false,
  breathingEffect = false,
  magneticEffect = false,
  hoverEffects = true,
  accessibility = true,
  reducedMotion = false,
  highContrast = false,
}) => {
  const mergedLabels = { ...defaultLabels, ...labels };
  const [networkInfo, setNetworkInfo] = useState<{ downlink: number | null; effectiveType: string; saveData: boolean }>({
    downlink: null,
    effectiveType: 'unknown',
    saveData: false,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<'loading' | 'completing' | 'completed'>('loading');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const updateNetworkInfo = useCallback(() => {
    let isMounted = true;
    getNetworkInfo().then((info) => {
      // Only update state if component is still mounted
      if (isMounted) {
        setNetworkInfo((prevInfo) => {
          if (
            info.downlink !== prevInfo.downlink ||
            info.effectiveType !== prevInfo.effectiveType ||
            info.saveData !== prevInfo.saveData
          ) {
            return info;
          }
          return prevInfo;
        });
      }
    }).catch(() => {
      // Silently fail if network info is not available
    });
    
    // Return cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Fade in effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto hide functionality
  useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setLoadingPhase('completing');
        setTimeout(() => setLoadingPhase('completed'), 500);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHideDelay]);

  // Progress-based phase management
  useEffect(() => {
    if (typeof progress === 'number') {
      if (progress >= 100) {
        setLoadingPhase('completing');
        setTimeout(() => setLoadingPhase('completed'), 800);
      } else if (progress >= 95) {
        setLoadingPhase('completing');
      } else {
        setLoadingPhase('loading');
      }
    }
  }, [progress]);

  // Mouse tracking for magnetic effect
  useEffect(() => {
    if (magneticEffect) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [magneticEffect]);

  useEffect(() => {
    if (disableNetworkInfo) return;
    
    // Skip network info in test environments
    if (typeof window !== 'undefined' && (window as any).__JEST__) return;
    
    const cleanup = updateNetworkInfo();
    const connection = navigator.connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    return () => {
      if (cleanup) cleanup();
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo, disableNetworkInfo]);

  // Enhanced keyframes with more animations
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    let style = document.getElementById('advanced-loader-keyframes') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'advanced-loader-keyframes';
      document.head.appendChild(style);
    }
    style.innerHTML = `
      @keyframes spin { 
        from { transform: rotate(0deg); } 
        to { transform: rotate(360deg); } 
      }
      @keyframes pulse { 
        0% { opacity: 0.4; transform: scale(0.95); } 
        50% { opacity: 1; transform: scale(1.05); } 
        100% { opacity: 0.4; transform: scale(0.95); } 
      }
      @keyframes dot-bounce { 
        0%, 80%, 100% { transform: scale(0) translateY(0); } 
        40% { transform: scale(1) translateY(-10px); } 
      }
      @keyframes wave { 
        0%, 40%, 100% { transform: scaleY(0.4); } 
        20% { transform: scaleY(1.0); } 
      }
      @keyframes bar { 
        0% { left: -35%; } 
        100% { left: 100%; } 
      }
      @keyframes ripple {
        0% { 
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      @keyframes square {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(90deg); }
        50% { transform: rotate(180deg); }
        75% { transform: rotate(270deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes infinity {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes cube {
        0%, 70%, 100% { transform: scale(1); }
        35% { transform: scale(1.2); }
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }
      @keyframes spiral {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes orbit {
        0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
        100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-20px); }
        60% { transform: translateY(-10px); }
      }
      @keyframes morph {
        0% { border-radius: 50%; transform: rotate(0deg); }
        25% { border-radius: 0%; transform: rotate(90deg); }
        50% { border-radius: 50%; transform: rotate(180deg); }
        75% { border-radius: 0%; transform: rotate(270deg); }
        100% { border-radius: 50%; transform: rotate(360deg); }
      }
      @keyframes gradient-spin {
        0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
        100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
      }
      @keyframes elastic {
        0% { transform: scale(1) rotateZ(0deg); }
        50% { transform: scale(1.25) rotateZ(180deg); }
        100% { transform: scale(1) rotateZ(360deg); }
      }
      @keyframes flip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(180deg); }
        100% { transform: rotateY(360deg); }
      }
      @keyframes scale {
        0% { transform: scale(0.8); }
        50% { transform: scale(1.2); }
        100% { transform: scale(0.8); }
      }
      @keyframes particles {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-50px) rotate(360deg); opacity: 0; }
      }
      @keyframes neon {
        0% { 
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
        }
        50% { 
          box-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; 
          text-shadow: 0 0 20px currentColor, 0 0 30px currentColor, 0 0 40px currentColor; 
        }
        100% { 
          box-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
          text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; 
        }
      }
      @keyframes breathe {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes fadeIn {
        0% { opacity: 0; transform: scale(0.9) translateY(20px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes slideIn {
        0% { transform: translateY(100px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      @keyframes colorShift {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
      }
    `;
  }, []);

  // Theme configurations
  const themes = {
    modern: {
      background: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      card: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(248, 250, 252, 0.9)',
      text: darkMode ? '#f1f5f9' : '#0f172a',
      textSecondary: darkMode ? '#94a3b8' : '#64748b',
      highlight: color,
      shadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      border: darkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.3)',
    },
    glass: {
      background: darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      card: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      text: darkMode ? '#ffffff' : '#000000',
      textSecondary: darkMode ? '#cbd5e1' : '#475569',
      highlight: color,
      shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      border: 'rgba(255, 255, 255, 0.18)',
    },
    neon: {
      background: 'rgba(0, 0, 0, 0.9)',
      card: 'rgba(20, 20, 20, 0.8)',
      text: '#00ffff',
      textSecondary: '#ff00ff',
      highlight: '#00ff00',
      shadow: '0 0 50px rgba(0, 255, 255, 0.5)',
      border: 'rgba(0, 255, 255, 0.3)',
    },
    minimal: {
      background: darkMode ? '#000000' : '#ffffff',
      card: darkMode ? '#111111' : '#f9f9f9',
      text: darkMode ? '#ffffff' : '#000000',
      textSecondary: darkMode ? '#888888' : '#666666',
      highlight: color,
      shadow: 'none',
      border: darkMode ? '#333333' : '#eeeeee',
    },
    gradient: {
      background: `linear-gradient(135deg, ${darkMode ? '#667eea 0%, #764ba2 100%' : '#f093fb 0%, #f5576c 100%'})`,
      card: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: '#f0f0f0',
      highlight: '#ffffff',
      shadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    classic: {
      background: darkMode ? '#2d3748' : '#f7fafc',
      card: darkMode ? '#4a5568' : '#ffffff',
      text: darkMode ? '#e2e8f0' : '#2d3748',
      textSecondary: darkMode ? '#a0aec0' : '#718096',
      highlight: color,
      shadow: darkMode ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(0, 0, 0, 0.1)',
      border: darkMode ? '#718096' : '#e2e8f0',
    }
  };

  const currentTheme = themes[customTheme] || themes.modern;

  // Enhanced gradient configurations
  const enhancedGradient = gradient || (vibrantColors ? [
    '#ff0099', '#00ff99', '#9900ff', '#ff9900', '#0099ff'
  ] : [color, accentColor]);

  const spinnerBorder = enhancedGradient.length > 1
    ? `conic-gradient(${enhancedGradient.join(', ')})`
    : undefined;

  const floatingAnimation = floatingStyle ? {
    animation: `float 3s ease-in-out infinite${breathingEffect ? ', breathe 2s ease-in-out infinite' : ''}`,
  } : {};

  // Helper function to convert hex to rgb
  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '99, 102, 241';
  }

  // Enhanced loader variants with new animations
  const renderSpinner = () => (
    <div
      style={{
        width: size,
        height: size,
        border: `${borderSize}px solid ${secondaryColor}`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: '50%',
        animation: `spin ${speed}s linear infinite${colorShift ? ', colorShift 4s linear infinite' : ''}`,
        position: 'relative',
        display: 'inline-block',
        background: 'transparent',
        ...(glow
          ? { 
              boxShadow: `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity}), inset 0 0 ${Math.round(size/8)}px rgba(${hexToRgb(color)}, ${glowIntensity/2})` 
            }
          : {}),
        ...floatingAnimation,
      }}
    >
      {typeof progress === 'number' && (
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - borderSize) / 2.2}
            fill="none"
            stroke={accentColor}
            strokeWidth={borderSize}
            strokeDasharray={2 * Math.PI * ((size - borderSize) / 2.2)}
            strokeDashoffset={
              2 * Math.PI * ((size - borderSize) / 2.2) * (1 - (progress / 100))
            }
            style={{ 
              transition: smoothTransitions ? 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
              filter: glow ? `drop-shadow(0 0 8px ${accentColor})` : undefined,
            }}
          />
        </svg>
      )}
    </div>
  );

  const renderGradientSpin = () => (
    <div
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 0deg, ${enhancedGradient.join(', ')}, ${enhancedGradient[0]})`,
        borderRadius: '50%',
        animation: `spin ${speed}s linear infinite`,
        position: 'relative',
        display: 'inline-block',
        ...floatingAnimation,
        ...(glow ? {
          boxShadow: `0 0 ${size/2}px rgba(${hexToRgb(color)}, ${glowIntensity})`
        } : {}),
        padding: borderSize,
      }}
    >
      <div
        style={{
          width: `${size - borderSize * 2}px`,
          height: `${size - borderSize * 2}px`,
          borderRadius: '50%',
          background: currentTheme.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {typeof progress === 'number' && (
          <span
            style={{
              fontSize: size * 0.2,
              fontWeight: 'bold',
              color: currentTheme.text,
            }}
          >
            {progress}%
          </span>
        )}
      </div>
    </div>
  );

  const renderDots = () => (
    <div style={{ 
      display: 'flex', 
      gap: size * 0.15,
      alignItems: 'center',
      justifyContent: 'center',
      ...floatingAnimation,
    }}>
      {Array.from({ length: Math.min(particleCount, 5) }, (_, i) => {
        const dotColor = enhancedGradient.length > 1
          ? enhancedGradient[i % enhancedGradient.length]
          : color;
        return (
          <div
            key={i}
            style={{
              width: size * 0.2,
              height: size * 0.2,
              borderRadius: '50%',
              backgroundColor: dotColor,
              animation: `dot-bounce ${1.4}s infinite both`,
              animationDelay: `${i * 0.16}s`,
              boxShadow: glow ? `0 0 ${Math.round(size/6)}px rgba(${hexToRgb(dotColor)}, ${glowIntensity})` : undefined,
            }}
          />
        );
      })}
    </div>
  );

  const renderWave = () => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'center',
      gap: size * 0.08, 
      height: size * 0.8,
      ...floatingAnimation,
    }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          style={{
            width: size * 0.12,
            height: size * 0.8,
            backgroundColor: enhancedGradient.length > 1
              ? enhancedGradient[i % enhancedGradient.length]
              : color,
            borderRadius: rounded ? `${size * 0.06}px` : '2px',
            animation: `wave ${1.2}s infinite ease-in-out`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: glow ? `0 0 ${Math.round(size/6)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );

  const renderParticles = () => (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    >
      {Array.from({ length: Math.min(particleCount, 4) }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: '50%',
            backgroundColor: enhancedGradient[i % enhancedGradient.length] || color,
            left: `${25 + (i * 12)}%`,
            top: `${25 + (i * 12)}%`,
            animation: `particles ${2 + (i * 0.3)}s infinite linear`,
            animationDelay: `${i * 0.4}s`,
            boxShadow: glow ? `0 0 ${size * 0.03}px currentColor` : undefined,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: '50%',
          backgroundColor: color,
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: glow ? `0 0 ${size * 0.15}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        }}
      />
    </div>
  );

  // More render functions for new animations
  const renderSpiral = () => (
    <div
      style={{
        width: size,
        height: size,
        border: `${borderSize}px solid transparent`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRight: `${borderSize}px solid ${accentColor}`,
        borderRadius: '50%',
        animation: `spin ${speed}s linear infinite`,
        boxShadow: glow ? `0 0 ${size/3}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderOrbit = () => (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.3,
          height: size * 0.3,
          marginTop: -size * 0.15,
          marginLeft: -size * 0.15,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: glow ? `0 0 ${size * 0.15}px ${color}` : undefined,
        }}
      />
      {Array.from({ length: 2 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size * 0.12,
            height: size * 0.12,
            marginTop: -size * 0.06,
            marginLeft: -size * 0.06,
            borderRadius: '50%',
            backgroundColor: enhancedGradient[i] || accentColor,
            animation: `orbit ${2 + i}s linear infinite`,
            animationDelay: `${i * 1}s`,
            boxShadow: glow ? `0 0 ${size * 0.08}px currentColor` : undefined,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'pulse 1.5s infinite ease-in-out',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderRipple = () => (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            border: `${borderSize}px solid ${color}`,
            opacity: 1,
            borderRadius: '50%',
            animation: `ripple 1.8s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
            animationDelay: `${i * 0.6}s`,
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            boxShadow: glow ? `0 0 ${Math.round(size/5)}px rgba(${hexToRgb(color)}, ${glowIntensity/2})` : undefined,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        }}
      />
    </div>
  );

  const renderSquare = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: color,
        animation: 'square 2s ease infinite',
        boxShadow: glow ? `0 0 ${Math.round(size/5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderInfinity = () => (
    <div
      style={{
        width: size * 1.2,
        height: size * 0.6,
        position: 'relative',
        display: 'inline-block',
        ...floatingAnimation,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size * 0.6,
          height: size * 0.6,
          border: `${borderSize}px solid ${color}`,
          borderRadius: '50%',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          animation: 'infinity 1.2s linear infinite',
          boxShadow: glow ? `0 0 ${Math.round(size/5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: size * 0.6,
          height: size * 0.6,
          border: `${borderSize}px solid ${color}`,
          borderRadius: '50%',
          borderLeftColor: 'transparent',
          borderTopColor: 'transparent',
          animation: 'infinity 1.2s linear infinite',
          boxShadow: glow ? `0 0 ${Math.round(size/5)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        }}
      />
    </div>
  );

  const renderCube = () => (
    <div style={{ 
      width: size, 
      height: size,
      display: 'inline-block',
      ...floatingAnimation,
    }}>
      <div style={{
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: color,
        animation: 'square 2s infinite ease-in-out',
        margin: size * 0.1,
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
      }}>
      </div>
    </div>
  );

  const renderBar = () => (
    <div
      style={{
        width: size * 1.5,
        height: borderSize * 3,
        backgroundColor: secondaryColor,
        borderRadius: rounded ? borderSize : 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-block',
        ...floatingAnimation,
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: '100%',
          width: '40%',
          background: enhancedGradient.length > 1
            ? `linear-gradient(90deg, ${enhancedGradient.join(', ')})`
            : color,
          borderRadius: rounded ? borderSize : 0,
          animation: 'bar 1.2s infinite linear',
          boxShadow: glow ? `0 0 ${Math.round(size/6)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        }}
      />
    </div>
  );

  const renderBounce = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'bounce 2s infinite',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderMorph = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        backgroundColor: color,
        animation: 'morph 3s infinite ease-in-out',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderElastic = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'elastic 2s infinite ease-in-out',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderFlip = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: rounded ? '20%' : '8px',
        backgroundColor: color,
        animation: 'flip 2s infinite ease-in-out',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderScale = () => (
    <div
      style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: '50%',
        backgroundColor: color,
        animation: 'scale 1.5s infinite ease-in-out',
        boxShadow: glow ? `0 0 ${Math.round(size/4)}px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
        display: 'inline-block',
        ...floatingAnimation,
      }}
    />
  );

  const renderNeon = () => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${borderSize}px solid ${color}`,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        animation: `spin ${speed}s linear infinite, neon 2s ease-in-out infinite alternate`,
        display: 'inline-block',
        position: 'relative',
        ...floatingAnimation,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: color,
          fontSize: size * 0.3,
          fontWeight: 'bold',
          animation: 'neon 2s ease-in-out infinite alternate',
        }}
      >
        ⚡
      </div>
    </div>
  );

  // Enhanced render function selector
  const validAnimations: LoaderAnimation[] = [
    'spin', 'dots', 'wave', 'bar', 'pulse', 'ripple', 'square', 'infinity', 'cube', 'spiral', 'orbit', 'bounce', 'morph', 'gradient-spin', 'elastic', 'flip', 'scale', 'particles', 'neon'
  ];
  const safeAnimationType = validAnimations.includes(animationType as LoaderAnimation) ? animationType : 'spin';

  const renderLoader = () => {
    const loaderProps = {
      style: {
        transition: smoothTransitions ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
        ...(reducedMotion ? { animationDuration: '3s' } : {}),
      }
    };

    switch (safeAnimationType) {
      case 'dots': 
        return <div {...loaderProps}>{renderDots()}</div>;
      case 'wave': 
        return <div {...loaderProps}>{renderWave()}</div>;
      case 'particles': 
        return <div {...loaderProps}>{renderParticles()}</div>;
      case 'spiral': 
        return <div {...loaderProps}>{renderSpiral()}</div>;
      case 'orbit': 
        return <div {...loaderProps}>{renderOrbit()}</div>;
      case 'gradient-spin': 
        return <div {...loaderProps}>{renderGradientSpin()}</div>;
      case 'pulse': 
        return <div {...loaderProps}>{renderPulse()}</div>;
      case 'ripple': 
        return <div {...loaderProps}>{renderRipple()}</div>;
      case 'square': 
        return <div {...loaderProps}>{renderSquare()}</div>;
      case 'infinity': 
        return <div {...loaderProps}>{renderInfinity()}</div>;
      case 'cube': 
        return <div {...loaderProps}>{renderCube()}</div>;
      case 'bar': 
        return <div {...loaderProps}>{renderBar()}</div>;
      case 'bounce': 
        return <div {...loaderProps}>{renderBounce()}</div>;
      case 'morph': 
        return <div {...loaderProps}>{renderMorph()}</div>;
      case 'elastic': 
        return <div {...loaderProps}>{renderElastic()}</div>;
      case 'flip': 
        return <div {...loaderProps}>{renderFlip()}</div>;
      case 'scale': 
        return <div {...loaderProps}>{renderScale()}</div>;
      case 'neon': 
        return <div {...loaderProps}>{renderNeon()}</div>;
      case 'spin':
      default: 
        return <div {...loaderProps}>{renderSpinner()}</div>;
    }
  };

  const renderIcon = () =>
    icon && (
      <div style={{ 
        marginBottom: 16, 
        fontSize: size * 0.8,
        color: currentTheme.highlight,
        filter: glow ? `drop-shadow(0 0 ${Math.round(size/12)}px rgba(${hexToRgb(color)}, ${glowIntensity}))` : undefined,
        ...floatingAnimation,
        animation: `${floatingAnimation.animation || ''} ${animationType === 'neon' ? ', neon 2s ease-in-out infinite alternate' : ''}`,
      }}>
        {icon}
      </div>
    );

  // Backdrop configuration
  const backdropStyle = backdrop ? {
    backgroundColor: customTheme === 'gradient' ? 'transparent' : (darkMode 
      ? `#181f2a` // solid dark
      : `#f4f6fa`), // solid light
    ...(blurBackground && (glassmorphism || customTheme === 'glass') ? {
      backdropFilter: 'blur(16px) saturate(180%)',
    } : {}),
    background: customTheme === 'gradient' ? currentTheme.background : undefined,
  } : {};

  // Glassmorphism effect
  const glassEffect = (glassmorphism || customTheme === 'glass') ? {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
  } : {};

  // Neumorphism effect
  const neomorphEffect = neumorphism ? {
    background: darkMode ? '#2d3748' : '#f0f0f0',
    boxShadow: darkMode 
      ? '20px 20px 40px #1a202c, -20px -20px 40px #404c64'
      : '20px 20px 40px #d1d1d1, -20px -20px 40px #ffffff',
    border: 'none',
  } : {};

  // Loading phase styles
  const phaseTransition = {
    opacity: loadingPhase === 'completed' ? 0 : 1,
    transform: loadingPhase === 'completing' ? 'scale(1.1)' : 'scale(1)',
    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (loadingPhase === 'completed') {
    return null;
  }

  return (
    <div
              style={{
          ...styles.loaderContainer,
          fontFamily: font,
          ...backdropStyle,
          ...currentTheme,
          ...customStyle,
          ...phaseTransition,
          opacity: isVisible ? 1 : 0,
          animation: isVisible ? `fadeIn ${fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : undefined,
        }}
      role={accessibility ? "status" : undefined}
      aria-label={accessibility ? (message || mergedLabels.loadingLabel) : undefined}
      aria-live={accessibility ? "polite" : undefined}
    >
      <div style={{
        ...styles.contentContainer,
        backgroundColor: currentTheme.card,
        boxShadow: currentTheme.shadow,
        borderRadius: rounded ? '24px' : '8px',
        border: `1px solid ${currentTheme.border}`,
        ...glassEffect,
        ...neomorphEffect,
        ...(hoverEffects && microInteractions ? {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        } : {}),
        ...(magneticEffect ? {
          transform: `translate(${(mousePosition.x - window.innerWidth/2) * 0.02}px, ${(mousePosition.y - window.innerHeight/2) * 0.02}px)`,
        } : {}),
      }}>
        
        {renderIcon()}
        
        <div style={{...styles.loaderWrapper, position: 'relative'}}>
          {renderLoader()}

        </div>

        {/* Progress and loading text */}
        {(typeof progress === 'number' && showPercentage) && (
          <div style={{
            ...styles.progressText,
            color: currentTheme.highlight,
            textShadow: glow ? `0 0 12px rgba(${hexToRgb(color)}, ${glowIntensity})` : undefined,
            fontSize: '22px',
            fontWeight: 700,
            marginTop: 16,
            animation: animationType === 'neon' ? 'neon 2s ease-in-out infinite alternate' : undefined,
          }}>
            {mergedLabels.percentLabel ? mergedLabels.percentLabel(progress) : `${Math.round(progress)}%`}
          </div>
        )}

        {/* Enhanced loading message */}
        {(message || showLoadingText) && (
          <div style={{
            ...styles.message,
            color: currentTheme.text,
            fontSize: '18px',
            fontWeight: 500,
            marginTop: 14,
            maxWidth: '400px',
            lineHeight: 1.6,
            textAlign: 'center',
            animation: microInteractions ? 'slideIn 0.6s ease-out' : undefined,
          }}>
            {message || `${mergedLabels.loadingLabel}...`}
          </div>
        )}

        {/* Enhanced retry information */}
        {showRetries && retries > 0 && (
          <div style={{
            ...styles.retryText,
            color: currentTheme.highlight,
            textShadow: glow ? `0 0 10px rgba(${hexToRgb(color)}, ${glowIntensity/2})` : undefined,
            fontSize: '16px',
            fontWeight: 600,
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: '12px',
            background: `rgba(${hexToRgb(color)}, 0.1)`,
            border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
            ...(pulseEffect ? { animation: 'pulse 2s infinite ease-in-out' } : {}),
          }}>
            {mergedLabels.retryLabel}: {retries}
          </div>
        )}

        {/* Enhanced network information */}
        {showNetworkInfo && (
          <div style={{
            ...styles.networkInfo,
            backgroundColor: currentTheme.card,
            color: currentTheme.textSecondary,
            boxShadow: `0 8px 32px ${darkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '16px',
            padding: '16px 24px',
            marginTop: 20,
            border: `1px solid ${currentTheme.border}`,
            minWidth: '280px',
            ...glassEffect,
          }}>
            <div style={styles.networkInfoItem}>
              <span style={{...styles.networkInfoLabel, color: currentTheme.text}}>
                {mergedLabels.speedLabel}:
              </span> 
              <span style={{
                ...styles.networkInfoValue, 
                color: currentTheme.highlight,
                fontWeight: 700,
              }}>
                {networkInfo.downlink !== null
                  ? `${networkInfo.downlink} Mbps`
                  : mergedLabels.gettingLabel}
              </span>
            </div>
            <div style={styles.networkInfoItem}>
              <span style={{...styles.networkInfoLabel, color: currentTheme.text}}>
                {mergedLabels.typeLabel}:
              </span> 
              <span style={{...styles.networkInfoValue, color: currentTheme.textSecondary}}>
                {networkInfo.effectiveType}
              </span>
            </div>
            <div style={styles.networkInfoItem}>
              <span style={{...styles.networkInfoLabel, color: currentTheme.text}}>
                {mergedLabels.saveDataLabel}:
              </span> 
              <span style={{
                ...styles.networkInfoValue, 
                color: networkInfo.saveData 
                  ? (darkMode ? '#10B981' : '#047857') 
                  : (darkMode ? '#F87171' : '#DC2626'),
                fontWeight: 600,
              }}>
                {networkInfo.saveData ? mergedLabels.saveDataOn : mergedLabels.saveDataOff}
              </span>
            </div>
          </div>
        )}

        {/* Children container */}
        {children && (
          <div style={{
            ...styles.childrenContainer,
            animation: microInteractions ? 'fadeIn 0.8s ease-out 0.2s both' : undefined,
          }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    maxWidth: '90%',
    borderRadius: '24px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  loaderWrapper: {
    margin: '24px 0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  retryText: {
    marginTop: 16,
    fontSize: '16px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  networkInfo: {
    marginTop: 20,
    fontSize: '15px',
    textAlign: 'center',
    borderRadius: '16px',
    padding: '16px 24px',
    width: '100%',
    maxWidth: '320px',
  },
  networkInfoItem: {
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkInfoLabel: {
    fontWeight: 500,
    marginRight: 12,
  },
  networkInfoValue: {
    fontWeight: 600,
    textAlign: 'right',
  },
  progressText: {
    marginTop: 16,
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textAlign: 'center',
  },
  message: {
    marginTop: 16,
    fontSize: '16px',
    textAlign: 'center',
    fontWeight: 500,
    lineHeight: 1.6,
    maxWidth: '400px',
  },
  childrenContainer: {
    marginTop: 24,
    width: '100%',
    textAlign: 'center',
  }
};

export default Loader;
