import { isNonProduction, redactSensitiveInfo } from '@src/utils';

// Get all sessionStorage data
export const interceptSessionStorage = () => {
  console.log('sessionStorageData 1');
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
  console.log('sessionStorageData', sessionStorageData);

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: { recordType: 'session-storage', source: 'client', items: sessionStorageData },
    },
    '*',
  );

  // chrome.runtime.sendMessage({
  //   type: 'ADD_RECORD',
  //   data: sessionStorageData, // In this case is an array, use flat() on parse
  // });
};
