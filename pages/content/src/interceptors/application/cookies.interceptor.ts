import { isNonProduction, redactSensitiveInfo } from '@src/utils';

// Get all cookies
export const interceptCookies = () => {
  const cookies = document.cookie.split(';').reduce((ac, str) => {
    const [key, value] = str.split('=').map(s => s.trim());

    if (!key) return ac;

    ac[key] = isNonProduction() ? value : redactSensitiveInfo(key, value);

    return ac;
  }, {});

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: { recordType: 'cookies', source: 'client', items: cookies },
    },
    '*',
  );
};
