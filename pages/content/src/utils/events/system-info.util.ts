const getIncognitoStatus = async (): Promise<boolean> => {
  return new Promise(resolve => {
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (!fs) {
      resolve(false);
      return;
    }
    fs(
      window.TEMPORARY,
      100,
      () => resolve(false),
      () => resolve(true),
    );
  });
};

const getBatteryInfo = async (): Promise<{ charging: boolean; level: number }> => {
  if ('getBattery' in navigator) {
    const battery = await (navigator as any).getBattery();
    return { charging: battery.charging, level: battery.level };
  }
  return { charging: false, level: 1 }; // Fallback if battery API is unavailable
};

const getBrowserZoomLevel = () => {
  const pixelRatio = window.devicePixelRatio;
  const zoomLevel = Math.round(devicePixelRatio * 100);

  return { pixelRatio, zoomLevel };
};

const parseUserAgent = () => {
  const uaData = navigator?.userAgentData || {};
  const userAgent = navigator.userAgent;

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  // Determine browser name and version
  if (uaData?.brands) {
    const browserInfo = uaData.brands.find(
      b =>
        b.brand.toLowerCase().includes('chrome') ||
        b.brand.toLowerCase().includes('edge') ||
        b.brand.toLowerCase().includes('safari'),
    );
    if (browserInfo) {
      browserName = browserInfo.brand;
      browserVersion = browserInfo.version;
    }
  } else {
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edg|Opera|Brave)\/([\d.]+)/);
    if (browserMatch) {
      browserName = browserMatch[1];
      browserVersion = browserMatch[2];
    }
  }

  // Determine OS name and version
  const platform = uaData.platform?.toLowerCase() || navigator.platform?.toLowerCase() || '';
  if (platform.includes('mac')) {
    osName = 'Mac OS';
    osVersion = userAgent.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (platform.includes('win')) {
    osName = 'Windows';
    osVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1] || 'Unknown';
  } else if (platform.includes('linux')) {
    osName = 'Linux';
  } else if (platform.includes('android')) {
    osName = 'Android';
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
  } else if (/iphone|ipad|ipod/.test(userAgent.toLowerCase())) {
    osName = 'iOS';
    osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  }

  return {
    browser: { name: browserName, version: browserVersion, ...getBrowserZoomLevel() },
    os: { name: osName, version: osVersion },
  };
};

export const getSystemInfo = async (): Promise<{
  battery: { charging: boolean; level: number };
  browser: { name: string; version: string; isIncognito: boolean };
  os: { name: string; version: string };
  brie: { version: string };
}> => {
  const systemInfo = parseUserAgent();
  const [isIncognito, batteryInfo] = await Promise.all([getIncognitoStatus(), getBatteryInfo()]);

  return {
    battery: batteryInfo,
    browser: { ...systemInfo.browser, isIncognito },
    os: systemInfo.os,
    brie: { version: '5.15.5' }, // Customize with your app version or remove if unnecessary
  };
};
