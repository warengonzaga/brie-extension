import { isNonProduction, redactSensitiveInfo } from '@src/utils';

// Get all sessionStorage data
export const interceptSessionStorage = () => {
  const sessionStorageData = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    const value = sessionStorage.getItem(key);
    sessionStorageData.push({
      recordType: 'session-storage',
      source: 'client',
      key,
      value: isNonProduction() ? value : redactSensitiveInfo(key, value),
    });
  }

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: { recordType: 'session-storage', source: 'client', items: sessionStorageData },
    },
    '*',
  );
};
