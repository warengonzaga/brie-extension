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

const parseUserAgent = () => {
  const uaData = navigator.userAgentData || {};
  const userAgent = navigator.userAgent;

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  // Determine browser name and version
  if (uaData.brands) {
    const browserInfo = uaData.brands.find(
      b => b.brand.includes('Chrome') || b.brand.includes('Edge') || b.brand.includes('Safari'),
    );
    if (browserInfo) {
      browserName = browserInfo.brand;
      browserVersion = browserInfo.version;
    }
  } else {
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/([\d.]+)/);
    if (browserMatch) {
      browserName = browserMatch[1];
      browserVersion = browserMatch[2];
    }
  }

  // Determine OS name and version
  const platform = uaData.platform || navigator.platform || '';
  if (platform.includes('Mac')) {
    osName = 'Mac OS';
    osVersion = userAgent.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  } else if (platform.includes('Win')) {
    osName = 'Windows';
    osVersion = userAgent.match(/Windows NT ([\d.]+)/)?.[1] || 'Unknown';
  } else if (platform.includes('Linux')) {
    osName = 'Linux';
    osVersion = 'Unknown';
  } else if (platform.includes('Android')) {
    osName = 'Android';
    osVersion = userAgent.match(/Android ([\d.]+)/)?.[1] || 'Unknown';
  } else if (/iPhone|iPad|iPod/.test(platform)) {
    osName = 'iOS';
    osVersion = userAgent.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || 'Unknown';
  }

  return {
    browser: { name: browserName, version: browserVersion },
    os: { name: osName, version: osVersion },
  };
};

export const getSystemInfo = async (): Promise<{
  isIncognito: boolean;
  battery: { charging: boolean; level: number };
  browser: { name: string; version: string };
  os: { name: string; version: string };
  brie: { version: string };
}> => {
  const systemInfo = parseUserAgent();
  const [isIncognito, batteryInfo] = await Promise.all([getIncognitoStatus(), getBatteryInfo()]);

  return {
    isIncognito,
    battery: batteryInfo,
    browser: systemInfo.browser,
    os: systemInfo.os,
    brie: { version: '5.15.5' }, // Customize with your app version or remove if unnecessary
  };
};
