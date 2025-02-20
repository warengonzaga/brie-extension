import { parseHeaders } from '@src/utils';

// Define interfaces for request details and payload
interface RequestDetails {
  method: string;
  url: string;
  requestStart: string;
  requestBody: Document | XMLHttpRequestBodyInit | null;
}

interface XHRPayload {
  recordType: string;
  source: string;
  method: string;
  url: string;
  requestStart: string;
  requestEnd: string;
  requestBody: Document | XMLHttpRequestBodyInit | null;
  status: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
}

// Extend the XMLHttpRequest type to include custom properties
interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  _requestDetails?: RequestDetails;
}

// XMLHttpRequest Interceptor
export const interceptXHR = (): void => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  // Intercept XMLHttpRequest open method
  XMLHttpRequest.prototype.open = function (
    this: ExtendedXMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: any[]
  ): void {
    this._requestDetails = {
      method,
      url: url.toString(),
      requestStart: new Date().toISOString(),
      requestBody: null,
    };
    originalOpen.apply(this, [method, url, ...rest]);
  };

  // Intercept XMLHttpRequest send method
  XMLHttpRequest.prototype.send = function (
    this: ExtendedXMLHttpRequest,
    body?: Document | XMLHttpRequestBodyInit | null,
  ): void {
    if (this._requestDetails) {
      this._requestDetails.requestBody = body || null;
    }

    const originalOnReadyStateChange = this.onreadystatechange;

    this.onreadystatechange = function (this: ExtendedXMLHttpRequest, ...args: any[]): void {
      if (this.readyState === 4 && this._requestDetails) {
        // Request completed
        const endTime = new Date().toISOString();
        const rawHeaders = this.getAllResponseHeaders();
        const responseHeaders = parseHeaders(
          rawHeaders
            .split('\r\n')
            .filter(line => line.includes(':'))
            .map(line => line.split(':').map(str => str.trim())),
        );

        // Ensure message posting is supported
        try {
          if (window.postMessage) {
            window.postMessage(
              {
                type: 'ADD_RECORD',
                payload: {
                  recordType: 'network',
                  source: 'client',
                  ...this._requestDetails,
                  requestEnd: endTime,
                  status: this.status,
                  responseHeaders,
                  responseBody: this.responseText,
                },
              },
              '*',
            );
          } else {
            console.warn('[XHR] window.postMessage is not supported.');
          }
        } catch (error) {
          console.error('[XHR] Error posting message:', error);
        }
      }

      // Call the original onreadystatechange handler if defined
      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.apply(this, args);
      }
    };

    originalSend.apply(this, [body]);
  };
};
