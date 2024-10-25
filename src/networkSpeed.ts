// This is our NetworkInfo interface. It’s what we’re gonna use to represent the user's network details.
export interface NetworkInfo {
  effectiveType: string; // This is the type of network connection, like '4g', '3g', or '2g'.
  downlink: number; // This is the download speed in Mbps (megabits per second).
  saveData: boolean; // This tells us if the user has their "data saver" mode on.
}

// Now, this NetworkInformation interface is what the browser gives us (if it supports the API).
// It's similar to the one above but also lets us add/remove event listeners for when the connection changes.
interface NetworkInformation {
  effectiveType: string; // Same deal: network type ('4g', '3g', etc.)
  downlink: number; // Download speed, still in Mbps.
  saveData: boolean; // Whether or not data saver mode is turned on.
  addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void; // Optional: To listen for changes in the connection.
  removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void; // Optional: To stop listening for those changes.
}

// Here we’re extending the Navigator interface to include the 'connection' property.
// This is where the browser sticks the network information, if the browser supports it.
declare global {
  interface Navigator {
    connection?: NetworkInformation; // This is where we access network info, if available.
  }
}

/**
 * So, `getNetworkInfo` is the function that grabs network info from the browser.
 * If the browser supports the Network Information API, it’ll give us the connection details
 * like the type of network (e.g., 4G) and download speed. Otherwise, we return some default values.
 * 
 * @returns {NetworkInfo} - An object containing the network connection details (type, speed, and data saver status).
 */
export function getNetworkInfo(): NetworkInfo {
  // We try to access `navigator.connection`, where the browser stores network info (if it supports it).
  const connection = navigator.connection;

  // If the browser supports the API, grab and return the actual connection details.
  if (connection) {
    const { effectiveType, downlink, saveData } = connection;
    return { effectiveType, downlink, saveData };
  }

  //If the browser doesn’t support the API, we just return some defaults.
  return { effectiveType: 'unknown', downlink: 0, saveData: false }; // We don't know the type, speed is 0, and no data saver info.
}