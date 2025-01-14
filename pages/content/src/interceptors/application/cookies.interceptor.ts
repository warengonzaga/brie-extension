import { isNonProduction, redactSensitiveInfo } from '@src/utils';

// Get all cookies
export const interceptCookies = () => {
  const cookies = document.cookie.split(';').reduce((ac, str) => {
    const [key, value] = str.split('=').map(s => s.trim());

    ac[key] = isNonProduction() ? value : redactSensitiveInfo(key, value);

    return ac;
  }, {});

  console.log('cookies', cookies);

  // chrome.runtime.sendMessage({
  //   type: 'ADD_RECORD',
  //   data: cookies, // In this case is an array, use flat() on parse
  // });

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: { recordType: 'cookies', source: 'client', items: cookies },
    },
    '*',
  );
};
