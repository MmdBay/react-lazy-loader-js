import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { getNetworkInfo } from './networkSpeed';

type LoaderAnimation = 'spinner' | 'dots' | 'wave' | 'bar';

interface LoaderLabels {
  retryLabel?: string;
  speedLabel?: string;
  typeLabel?: string;
  saveDataLabel?: string;
  saveDataOn?: string;
  saveDataOff?: string;
  gettingLabel?: string;
  percentLabel?: (progress: number) => string;
  messageLabel?: string;
}

interface LoaderProps {
  size?: number;
  borderSize?: number;
  color?: string;
  gradient?: string[]; // For multi-color/gradient
  speed?: number;
  retries?: number;
  showRetries?: boolean;
  showNetworkInfo?: boolean;
  customStyle?: React.CSSProperties;
  shadow?: string;
  glow?: boolean;
  animationType?: LoaderAnimation;
  icon?: ReactNode;
  progress?: number; // 0-100, if you want to show progress
  message?: string;
  darkMode?: boolean;
  children?: ReactNode;
  labels?: LoaderLabels;
}

const defaultLabels: LoaderLabels = {
  retryLabel: 'تلاش مجدد',
  speedLabel: 'سرعت',
  typeLabel: 'نوع اتصال',
  saveDataLabel: 'صرفه‌جویی دیتا',
  saveDataOn: 'فعال',
  saveDataOff: 'غیرفعال',
  gettingLabel: 'در حال دریافت...',
  percentLabel: (progress) => `${progress}%`,
  messageLabel: '',
};

const Loader: React.FC<LoaderProps> = ({
  size = 60,
  borderSize = 6,
  color = '#4f8cff',
  gradient,
  speed = 1.2,
  retries = 0,
  showRetries = true,
  showNetworkInfo = true,
  customStyle = {},
  shadow = '0 0 24px 0 #4f8cff55',
  glow = true,
  animationType = 'spinner',
  icon,
  progress,
  message,
  darkMode = false,
  children,
  labels = {},
}) => {
  const mergedLabels = { ...defaultLabels, ...labels };
  const [networkInfo, setNetworkInfo] = useState<{ downlink: number | null; effectiveType: string; saveData: boolean }>({
    downlink: null,
    effectiveType: 'unknown',
    saveData: false,
  });

  const updateNetworkInfo = useCallback(() => {
    getNetworkInfo().then((info) => {
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
    });
  }, []);

  useEffect(() => {
    updateNetworkInfo();
    const connection = navigator.connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateNetworkInfo);
    }
    return () => {
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]);

  // Inject keyframes for all animations if not already present
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('loader-keyframes')) {
      const style = document.createElement('style');
      style.id = 'loader-keyframes';
      style.innerHTML = `
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        @keyframes pulse { 0% { opacity: 0.7; transform: scale(1);} 50% { opacity: 0.2; transform: scale(1.15);} 100% { opacity: 0.7; transform: scale(1);} }
        @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0);} 40% { transform: scale(1);} }
        @keyframes wave { 0%, 40%, 100% { transform: scaleY(0.4);} 20% { transform: scaleY(1.0);} }
        @keyframes bar { 0% { left: -40%; } 100% { left: 100%; } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Gradient or single color
  const spinnerBorder = gradient
    ? `conic-gradient(${gradient.join(', ')})`
    : undefined;

  // Loader variants
  const renderSpinner = () => (
    <div
      style={{
        width: size,
        height: size,
        border: `${borderSize}px solid #e0e7ff`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: '50%',
        boxShadow: shadow,
        animation: `spin ${speed}s cubic-bezier(.68,-0.55,.27,1.55) infinite`,
        position: 'relative',
        background: spinnerBorder,
        ...(glow
          ? { filter: `drop-shadow(0 0 12px ${color}99)` }
          : {}),
      }}
    >
      {/* Progress circle (if progress is defined) */}
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
            stroke={color}
            strokeWidth={borderSize}
            strokeDasharray={2 * Math.PI * ((size - borderSize) / 2.2)}
            strokeDashoffset={
              2 * Math.PI * ((size - borderSize) / 2.2) * (1 - (progress / 100))
            }
            style={{ transition: 'stroke-dashoffset 0.4s' }}
          />
        </svg>
      )}
    </div>
  );

  const renderDots = () => (
    <div style={{ display: 'flex', gap: size * 0.12 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: '50%',
            background: gradient
              ? `linear-gradient(135deg, ${gradient.join(', ')})`
              : color,
            animation: `dot-bounce 1.4s infinite both`,
            animationDelay: `${i * 0.16}s`,
            boxShadow: glow ? `0 0 8px ${color}99` : undefined,
          }}
        />
      ))}
    </div>
  );

  const renderWave = () => (
    <div style={{ display: 'flex', alignItems: 'end', gap: size * 0.08, height: size * 0.5 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: size * 0.12,
            height: size * 0.5,
            background: gradient
              ? `linear-gradient(135deg, ${gradient.join(', ')})`
              : color,
            borderRadius: 6,
            animation: `wave 1.2s infinite ease-in-out`,
            animationDelay: `${i * 0.1}s`,
            boxShadow: glow ? `0 0 8px ${color}99` : undefined,
          }}
        />
      ))}
    </div>
  );

  const renderBar = () => (
    <div
      style={{
        width: size * 1.2,
        height: borderSize * 2.2,
        background: '#e0e7ff',
        borderRadius: borderSize,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: '100%',
          width: '40%',
          background: gradient
            ? `linear-gradient(90deg, ${gradient.join(', ')})`
            : color,
          borderRadius: borderSize,
          animation: 'bar 1.2s infinite linear',
          boxShadow: glow ? `0 0 8px ${color}99` : undefined,
        }}
      />
    </div>
  );

  const renderIcon = () =>
    icon && (
      <div style={{ marginBottom: 12, fontSize: size * 0.7 }}>{icon}</div>
    );

  // Theme
  const themeStyles = darkMode
    ? {
        background: 'linear-gradient(135deg, #23272f 0%, #2d3748 100%)',
        color: '#e0e7ff',
      }
    : {};

  return (
    <div
      style={{
        ...styles.loaderContainer,
        ...themeStyles,
        ...customStyle,
      }}
    >
      {renderIcon()}
      {animationType === 'spinner' && renderSpinner()}
      {animationType === 'dots' && renderDots()}
      {animationType === 'wave' && renderWave()}
      {animationType === 'bar' && renderBar()}
      {typeof progress === 'number' && (
        <div style={styles.progressText}>{mergedLabels.percentLabel ? mergedLabels.percentLabel(progress) : `${progress}%`}</div>
      )}
      {showRetries && <div style={styles.retryText}>{mergedLabels.retryLabel}: {retries}</div>}
      {showNetworkInfo && (
        <div style={styles.networkInfo}>
          <div>
            {mergedLabels.speedLabel}: {' '}
            {networkInfo.downlink !== null
              ? `${networkInfo.downlink} Mbps`
              : mergedLabels.gettingLabel}
          </div>
          <div>{mergedLabels.typeLabel}: {networkInfo.effectiveType}</div>
          <div>{mergedLabels.saveDataLabel}: {networkInfo.saveData ? mergedLabels.saveDataOn : mergedLabels.saveDataOff}</div>
        </div>
      )}
      {message && <div style={styles.message}>{message}</div>}
      {children}
    </div>
  );
};

const styles: { [key: string]: any } = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    transition: 'background 0.3s',
  },
  retryText: {
    marginTop: 18,
    fontSize: '18px',
    color: '#4f8cff',
    fontWeight: 600,
    letterSpacing: 1,
    textShadow: '0 1px 8px #b6ccff',
  },
  networkInfo: {
    marginTop: 8,
    fontSize: '15px',
    color: '#555',
    textAlign: 'center',
    background: '#f3f6ffcc',
    borderRadius: 8,
    padding: '8px 16px',
    boxShadow: '0 2px 8px #e0e7ff',
  },
  progressText: {
    marginTop: 10,
    fontSize: '16px',
    color: '#4f8cff',
    fontWeight: 700,
    letterSpacing: 1,
  },
  message: {
    marginTop: 14,
    fontSize: '16px',
    color: '#333',
    textAlign: 'center',
    fontWeight: 500,
  },
};

export default Loader;
