import { isNonProduction, redactSensitiveInfo } from '@src/utils';

// Get all localStorage data
export const interceptLocalStorage = () => {
  const localStorageData = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    localStorageData.push({
      key,
      value: isNonProduction() ? value : redactSensitiveInfo(key, value),
    });
  }

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: { recordType: 'local-storage', source: 'client', items: localStorageData },
    },
    '*',
  );
};
