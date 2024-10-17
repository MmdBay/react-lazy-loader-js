export interface NetworkInfo {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  }
  
  interface NetworkInformation {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  }
  

  declare global {
    interface Navigator {
      connection?: NetworkInformation;
    }
  }
  
  /**
   * Get network information from the browser's Network Information API.
   * If the API is not supported, returns default values.
   * @returns {NetworkInfo} Information about the user's internet connection.
   */
  export function getNetworkInfo(): NetworkInfo {

    const connection = navigator.connection;
  
    if (connection) {
      const { effectiveType, downlink, saveData } = connection;
      return { effectiveType, downlink, saveData };
    }
  

    return { effectiveType: 'unknown', downlink: 0, saveData: false };
  }
  