import { extractQueryParams, parseHeaders } from '@src/utils';

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
  body?: BodyInit | null;
}

interface ParsedResponse {
  recordType: string;
  source: string;
  method: string;
  url: string;
  queryParams: Record<string, string | string[]>;
  requestHeaders: HeadersInit;
  requestBody: BodyInit | null;
  responseHeaders: Record<string, string>;
  responseBody: string | object;
  requestStart: string;
  requestEnd: string;
  status: number;
}

// Fetch Interceptor
export const interceptFetch = (): void => {
  const originalFetch = window.fetch;

  window.fetch = async function (...args: [RequestInfo | URL, FetchOptions?]): Promise<Response> {
    const [url, options] = args;
    const startTime = new Date().toISOString();

    try {
      const method = options?.method || 'GET';
      const requestHeaders = options?.headers || {};
      const queryParams = extractQueryParams(url.toString());
      const requestBody = options?.body || null;

      // Initiate the fetch request
      const response = await originalFetch.apply(this, args);
      const endTime = new Date().toISOString();

      // Clone the response for body parsing
      const responseClone = response.clone();
      const responseHeaders = parseHeaders(responseClone.headers);

      let responseBody: string | object;
      try {
        // Handling content types for JSON, text, and binary responses
        const contentType = responseClone.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          responseBody = await responseClone.json();
        } else if (contentType?.includes('text')) {
          responseBody = await responseClone.text();
        } else if (contentType?.includes('application/xml') || contentType?.includes('text/xml')) {
          responseBody = await responseClone.text();
        } else if (contentType?.includes('application/octet-stream')) {
          responseBody = 'BRIE: Binary content - Unable to display';
        } else {
          responseBody = 'BRIE: Unsupported content type';
        }
      } catch (error) {
        console.error('Failed to parse fetch response body:', error);
        responseBody = 'BRIE: Error parsing response body';
      }

      // Post message to main thread (ensure compatibility)
      try {
        if (window.postMessage) {
          window.postMessage(
            {
              type: 'ADD_RECORD',
              payload: {
                recordType: 'network',
                source: 'client',
                method,
                url: url.toString(),
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
        } else {
          console.warn('[Fetch] window.postMessage is not supported.');
        }
      } catch (error) {
        console.error('[Fetch] Error posting message:', error);
      }

      return response;
    } catch (error) {
      console.error('Error intercepting fetch:', error);
      return originalFetch.apply(this, args);
    }
  };
};
