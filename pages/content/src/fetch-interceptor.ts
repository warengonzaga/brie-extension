// Utility to extract query parameters
export const extractQueryParams = url => {
  try {
    const params = new URL(url, window.location.origin).searchParams;
    return Object.fromEntries(params.entries());
  } catch (error) {
    console.error('Error extracting query parameters:', error);
    return {};
  }
};

// Utility to parse headers
export const parseHeaders = headers => {
  const parsedHeaders = {};
  headers.forEach((value, key) => {
    parsedHeaders[key] = value;
  });
  return parsedHeaders;
};

// Utility to truncate large responses
export const truncateResponse = responseBody => {
  return typeof responseBody === 'string' && responseBody.length > 1000
    ? responseBody.slice(0, 1000) + '... (truncated)'
    : responseBody;
};

// Fetch Interceptor
export const interceptFetch = capturedRequests => {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    console.log(`[Fetch] Intercepted args:`, args);
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

      const req = {
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
      };

      console.log(`[Fetch] Intercepted request:`, req);
      capturedRequests.push(req);

      return response;
    } catch (error) {
      console.error('Error intercepting fetch:', error);
      return originalFetch.apply(this, args);
    }
  };
};
