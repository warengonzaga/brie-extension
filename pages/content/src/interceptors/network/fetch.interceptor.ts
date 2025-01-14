import { extractQueryParams, parseHeaders } from '@src/utils';

// Fetch Interceptor
export const interceptFetch = () => {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [url, options] = args;
    const startTime = new Date().toISOString();

    try {
      const method = options?.method || 'GET';
      const requestHeaders = options?.headers || {};
      const queryParams = extractQueryParams(url);
      const requestBody = options?.body || null;

      const response = await originalFetch.apply(this, args);
      const endTime = new Date().toISOString();

      const responseClone = response.clone();
      const responseHeaders = parseHeaders(responseClone.headers);
      let responseBody;

      try {
        const contentType = responseClone.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          responseBody = await responseClone.json();
        } else if (contentType?.includes('text')) {
          responseBody = await responseClone.text();
        } else {
          responseBody = 'Unsupported content type';
        }
      } catch (error) {
        console.error('Failed to parse fetch response body:', error);
        responseBody = 'Error parsing response body';
      }

      try {
        window.postMessage(
          {
            type: 'ADD_RECORD',
            payload: {
              recordType: 'network',
              source: 'client',
              method,
              url,
              queryParams,
              requestHeaders,
              requestBody,
              responseHeaders,
              responseBody,
              requestStart: startTime,
              requestEnd: endTime,
              status: response.status,
            },
          },
          '*',
        );
      } catch (error) {
        console.log('[Fetch] ', error);
      }

      return response;
    } catch (error) {
      console.error('Error intercepting fetch:', error);
      return originalFetch.apply(this, args);
    }
  };
};
