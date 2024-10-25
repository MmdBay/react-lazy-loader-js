import React, { useState, useEffect, useCallback } from 'react';
import { getNetworkInfo } from './networkSpeed'; // This function grabs network info like speed and type

// Here we're setting up the props for our Loader component, giving users options to tweak it
interface LoaderProps {
  size?: number; // Size of the spinner (default is 50px if not provided)
  borderSize?: number; // Thickness of the spinner's border
  color?: string; // Color of the spinner (black by default)
  speed?: number; // How fast the spinner rotates (in seconds per full spin)
  retries?: number; // How many retry attempts have been made (we default to 0)
  showRetries?: boolean; // Whether to show the retry count or not
  showNetworkInfo?: boolean; // Whether to show network speed/type
  customStyle?: React.CSSProperties; // Extra custom styles for the loader container (if someone wants to customize it further)
}

/**
 * This is the `Loader` component that shows a spinner while something is loading. 
 * It can also optionally show retry attempts and network info, depending on the props passed in.
 */
const Loader: React.FC<LoaderProps> = ({
  size = 50, // If no size is provided, we default to 50px
  borderSize = 4, // Border thickness defaults to 4px
  color = '#000', // Default color is black
  speed = 1, // It rotates once every 1 second by default
  retries = 0, // Starts with 0 retries
  showRetries = true, // We show retries by default
  showNetworkInfo = true, // We also show network info by default
  customStyle = {}, // No custom styles by default
}) => {
  // This state holds the network info like speed, type, and whether data saver is on
  const [networkInfo, setNetworkInfo] = useState<{ downlink: number | null; effectiveType: string; saveData: boolean }>({
    downlink: null, // Start with no info on download speed
    effectiveType: 'unknown', // Start with an unknown connection type
    saveData: false, // Assume data saver is off to start
  });

  /**
   * This function `updateNetworkInfo` grabs the network info and updates our state if it changes.
   * We use `useCallback` here to make sure the function doesn’t get recreated on every render — 
   * it's only made once.
   */
  const updateNetworkInfo = useCallback(() => {
    const info = getNetworkInfo(); // Grab the current network info
    setNetworkInfo((prevInfo) => {
      // Only update the state if the network info has changed
      if (
        info.downlink !== prevInfo.downlink ||
        info.effectiveType !== prevInfo.effectiveType ||
        info.saveData !== prevInfo.saveData
      ) {
        return info; // If something has changed, update it
      }
      return prevInfo; // Otherwise, just keep the previous state
    });
  }, []);

  /**
   * This effect runs once when the component mounts. It fetches the initial network info 
   * and listens for changes in the network connection (like switching from Wi-Fi to 4G).
   */
  useEffect(() => {
    updateNetworkInfo(); // Get the initial network info when the component loads

    // Check if the browser supports the Network Information API
    const connection = navigator.connection;
    if (connection && connection.addEventListener) {
      // If it does, listen for changes in the network status
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Cleanup function: remove the listener when the component unmounts
    return () => {
      if (connection && connection.removeEventListener) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [updateNetworkInfo]); // `updateNetworkInfo` is a dependency, so the effect only runs when it changes

  return (
    <div style={{ ...styles.loaderContainer, ...customStyle }}> {/* Combine custom styles with our default styles */}
      {/* The spinner itself */}
      <div
        style={{
          ...styles.loader,
          borderWidth: borderSize, // Spinner border thickness
          borderColor: `${color} transparent transparent transparent`, // Spinner color
          width: size, // Set the size of the spinner (width and height)
          height: size,
          animation: `spin ${speed}s linear infinite`, // How fast it spins (based on `speed` prop)
        }}
      ></div>
      
      {/* If showRetries is true, display the retry count */}
      {showRetries && <div style={styles.retryText}>Retries: {retries}</div>}
      
      {/* If showNetworkInfo is true, show network speed, connection type, and data saver status */}
      {showNetworkInfo && (
        <div style={styles.networkInfo}>
          <div>Speed: {networkInfo.downlink !== null ? `${networkInfo.downlink} Mbps` : 'Loading...'}</div>
          <div>Connection Type: {networkInfo.effectiveType}</div>
          <div>Data Saver: {networkInfo.saveData ? 'Enabled' : 'Disabled'}</div>
        </div>
      )}
    </div>
  );
};

// These are the default styles for our loader
const styles: { [key: string]: React.CSSProperties } = {
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loader: {
    borderRadius: '50%',
    borderStyle: 'solid',
    boxSizing: 'border-box',
  },
  retryText: {
    marginTop: 10,
    fontSize: '16px',
    color: '#000',
  },
  networkInfo: {
    marginTop: 5,
    fontSize: '14px',
    color: '#555',
    textAlign: 'center',
  },
};

export default Loader;
