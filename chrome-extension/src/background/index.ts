import 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import { annotationsRedoStorage, annotationsStorage, captureStateStorage, captureTabStorage } from '@extension/storage';

// Global map to store requests by requestId
const recordsMap = new Map();

// Add or merge requests
const addOrMergeRecords = (record: any) => {
  const uuid = uuidv4();

  if (record.recordType === 'events') {
    recordsMap.set(uuid, record);

    return;
  }

  if (record.recordType !== 'network') {
    recordsMap.set(uuid, { uuid, ...record });

    return;
  }

  const { url, ...others } = record;

  // IMPROVE: other events doesnot have an unique url, such cookies etc

  // Ensure there's an existing entry for this requestId
  if (!recordsMap.has(url)) {
    recordsMap.set(url, { url, uuid, ...others });
  }

  // Add the requestBody data to the request
  const recordData = recordsMap.get(url);

  for (const [key, value] of Object.entries(others)) {
    if (!recordData[key]) {
      recordData[key] = value;
    }

    if (key === 'requestBody' && recordData[key] && recordData[key].raw) {
      const rowRequestBody = recordData[key].raw;

      if (!rowRequestBody.length) {
        recordData[key]['parsed'] = null;
        continue;
      }

      // Convert raw byte array to a string
      const rawBytes = rowRequestBody[0].bytes;
      const byteArray = new Uint8Array(rawBytes);

      // Convert the byte array to a string (assuming UTF-8 encoding)
      const decoder = new TextDecoder('utf-8');
      const decodedBody = decoder.decode(byteArray);

      // Now you can parse the body if it's JSON or handle it otherwise
      try {
        recordData[key]['parsed'] = JSON.parse(decodedBody);
      } catch (e) {
        console.log('[addOrMergeRecord] Error: ', e);

        // If it's not JSON, just store the raw decoded string
        // requestData[key].row = decodedBody;
      }
    }
  }
};

chrome.tabs.onRemoved.addListener(async tabId => {
  const captureTabId = await captureTabStorage.getCaptureTabId();
  if (tabId === captureTabId) {
    await captureStateStorage.setCaptureState('idle');
    await captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== 'loading') return;

  const [state, capturedTabId] = await Promise.all([
    captureStateStorage.getCaptureState(),
    captureTabStorage.getCaptureTabId(),
  ]);

  if (!capturedTabId && state === 'unsaved') {
    await captureStateStorage.setCaptureState('idle');
  }

  if (tabId === capturedTabId) {
    await captureStateStorage.setCaptureState('idle');
    await captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
  }
});

/**
 * do not use async/await for onMessage listeners
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXIT_CAPTURE') {
    captureStateStorage.setCaptureState('idle');
    captureTabStorage.setCaptureTabId(null);

    annotationsStorage.setAnnotations([]);
    annotationsRedoStorage.setAnnotations([]);
    sendResponse({ status: 'success' });
  }

  if (message.type === 'ADD_RECORD') {
    // Merge fetch request data from content script
    addOrMergeRecords(message.data);
    sendResponse({ status: 'success' });
  }

  if (message.type === 'GET_REQUESTS') {
    sendResponse({ requests: Array.from(recordsMap.values()) });
  }

  if (message.action === 'checkNativeCapture') {
    sendResponse({ isAvailable: !!chrome.tabs?.captureVisibleTab });
  }

  if (message.action === 'captureVisibleTab') {
    // Handle the async operation
    chrome.tabs.captureVisibleTab(
      null, // Current window
      { format: 'png', quality: 80 },
      dataUrl => {
        if (chrome.runtime.lastError) {
          console.error('Error capturing screenshot:', chrome.runtime.lastError);
          sendResponse({ success: false, message: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, dataUrl });
        }
      },
    );
  }

  return true; // Keep the connection open for async handling
});

// Listener for onCompleted
chrome.webRequest.onCompleted.addListener(
  record => {
    addOrMergeRecords({ recordType: 'network', source: 'background', ...record });
  },
  { urls: ['<all_urls>'] },
);

// Listener for onBeforeRequest
chrome.webRequest.onBeforeRequest.addListener(
  record => {
    addOrMergeRecords({ recordType: 'network', source: 'background', ...record });
  },
  { urls: ['<all_urls>'] },
  ['requestBody'],
);

// Listener for onBeforeSendHeaders
chrome.webRequest.onBeforeSendHeaders.addListener(
  record => {
    addOrMergeRecords({ recordType: 'network', source: 'background', ...record });
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders'],
);
