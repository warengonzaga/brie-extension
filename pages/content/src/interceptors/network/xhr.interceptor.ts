import { parseHeaders } from '@src/utils';

// XMLHttpRequest Interceptor
export const interceptXHR = () => {
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._requestDetails = { method, url, requestStart: new Date().toISOString() };
    return originalOpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this._requestDetails.requestBody = body || null;

    const originalOnReadyStateChange = this.onreadystatechange;
    this.onreadystatechange = function () {
      if (this.readyState === 4) {
        // Request completed
        const endTime = new Date().toISOString();
        const responseHeaders = parseHeaders(
          this.getAllResponseHeaders()
            .split('\r\n')
            .filter(line => line.includes(':'))
            .map(line => line.split(':').map(str => str.trim())),
        );

        try {
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
        } catch (error) {
          console.log('[XHR] ', error);
        }
      }

      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.apply(this, arguments);
      }
    };

    return originalSend.apply(this, arguments);
  };
};
