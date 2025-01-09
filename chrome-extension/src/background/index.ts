import 'webextension-polyfill';

import { annotationsRedoStorage, annotationsStorage, captureStateStorage, captureTabStorage } from '@extension/storage';

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

chrome.tabs.onRemoved.addListener(async tabId => {
  console.log('On Removed Listener: ', tabId);

  const captureTabId = await captureTabStorage.getCaptureTabId();
  if (tabId === captureTabId) {
    await captureStateStorage.setCaptureState('idle');
    await captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  console.log('On onUpdated Listener: ', changeInfo.status);

  if (changeInfo.status !== 'loading') return;

  const captureTabId = await captureTabStorage.getCaptureTabId();
  if (tabId === captureTabId) {
    await captureStateStorage.setCaptureState('idle');
    await captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  if (message.type === 'EXIT_CAPTURE') {
    await captureStateStorage.setCaptureState('idle');
    await captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  }

  sendResponse({ status: 'Message received' });
});

// Global map to store requests by requestId
const requestsMap = new Map();

// Listener for onCompleted
chrome.webRequest.onCompleted.addListener(
  details => {
    const { requestId, ...others } = details;

    if (!requestsMap.has(requestId)) {
      requestsMap.set(requestId, { requestId, ...others });
    }

    // Add the onCompleted data to the existing request entry
    const requestData = requestsMap.get(requestId);

    for (const [key, value] of Object.entries(others)) {
      if (!requestData[key]) requestData[key] = value;
    }

    // Log and show the consolidated request
    console.log('Request onCompleted:', requestData);
  },
  { urls: ['<all_urls>'] },
);

// Listener for onBeforeRequest
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const { requestId, ...others } = details;

    // Ensure there's an existing entry for this requestId
    if (!requestsMap.has(requestId)) {
      requestsMap.set(requestId, { requestId, ...others });
    }

    // Add the requestBody data to the request
    const requestData = requestsMap.get(requestId);

    for (const [key, value] of Object.entries(others)) {
      console.log('key, value', key, value);

      if (!requestData[key]) {
        requestData[key] = value;
      }

      if (key === 'requestBody' && requestData[key] && requestData[key].raw) {
        console.log('requestBody heererr');

        const rowRequestBody = requestData[key].raw;
        // Convert raw byte array to a string
        const rawBytes = rowRequestBody[0].bytes;
        const byteArray = new Uint8Array(rawBytes);

        // Convert the byte array to a string (assuming UTF-8 encoding)
        const decoder = new TextDecoder('utf-8');
        const decodedBody = decoder.decode(byteArray);

        // Now you can parse the body if it's JSON or handle it otherwise
        try {
          requestData[key]['parsed'] = JSON.parse(decodedBody);
        } catch (e) {
          console.log('eeeerrrroooorrrr');

          // If it's not JSON, just store the raw decoded string
          // requestData[key]. = decodedBody;
        }
      }
    }

    // Log and show the consolidated request
    console.log('Request onBeforeRequest:', requestData);
  },
  { urls: ['<all_urls>'] },
  ['requestBody'],
);

// Listener for onBeforeSendHeaders
chrome.webRequest.onBeforeSendHeaders.addListener(
  details => {
    const { requestId, ...others } = details;

    // Ensure there's an existing entry for this requestId
    if (!requestsMap.has(requestId)) {
      requestsMap.set(requestId, { requestId, ...others });
    }

    // Add the requestHeaders data to the request
    const requestData = requestsMap.get(requestId);

    for (const [key, value] of Object.entries(others)) {
      if (!requestData[key]) requestData[key] = value;
    }

    // Log and show the consolidated request
    console.log('Request onBeforeSendHeaders:', requestData);
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders'],
);

setTimeout(() => {
  console.log('All logged requests:', Array.from(requestsMap.values()));
}, 10000); // Log all requests after 10 seconds, for example
