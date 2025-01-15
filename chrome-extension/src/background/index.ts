import 'webextension-polyfill';

import { annotationsRedoStorage, annotationsStorage, captureStateStorage, captureTabStorage } from '@extension/storage';
import { addOrMergeRecords, getRecords } from '@src/utils';

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
 * NOTE: Do Not Use async/await in onMessage listeners
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
    sendResponse({ requests: getRecords() });
  }

  if (message.action === 'checkNativeCapture') {
    sendResponse({ isAvailable: !!chrome.tabs?.captureVisibleTab });
  }

  if (message.action === 'captureVisibleTab') {
    // Handle the async operation
    chrome.tabs.captureVisibleTab(
      null, // Current window
      { format: 'jpeg', quality: 100 },
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
