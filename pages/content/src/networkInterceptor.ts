import { interceptFetch } from './fetch-interceptor';
import { interceptXHR } from './xhr-interceptor';

const fetchCapturedRequests = [];
const xhrCapturedRequests = [];

// Initialize interceptors
interceptFetch(fetchCapturedRequests);
interceptXHR(xhrCapturedRequests);

// Example function to log all captured requests
window.logCapturedRequests = function () {
  console.log('XHR Captured Requests:', xhrCapturedRequests);
  console.log('FETCH Captured Requests:', fetchCapturedRequests);
};
