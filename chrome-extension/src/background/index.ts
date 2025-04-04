import 'webextension-polyfill';
import { v4 as uuidv4 } from 'uuid';

import {
  annotationsRedoStorage,
  annotationsStorage,
  captureStateStorage,
  captureTabStorage,
  userUUIDStorage,
} from '@extension/storage';
import { addOrMergeRecords, getRecords } from '@src/utils';
import { traverseInformation } from '@extension/shared';

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

  if (sender?.tab?.id) {
    if (message.type === 'ADD_RECORD') {
      // Merge fetch request data from content script
      addOrMergeRecords(sender.tab.id, message.data);
      sendResponse({ status: 'success' });
    }

    if (message.type === 'GET_RECORDS') {
      console.log('get records called,', sender.tab.id, getRecords(sender.tab.id));

      getRecords(sender.tab.id).then(records => sendResponse({ records }));
    }
  } else {
    console.log('[Background] - Add Records: No sender id');
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

chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install') {
    /**
     * Set unique identifier for the user
     * to store reported bugs when no account
     */
    const userUuid = await userUUIDStorage.get();
    if (!userUuid) await userUUIDStorage.update(uuidv4());

    // Open a welcome page
    // await chrome.tabs.create({ url: 'welcome.html' });
  }
});

/**
 * @todo
 * there is an scenario when tabId is -1,
 * but we know the requestId and we can use it to populate the right request data
 *
 * related to all 3 web req states
 */

// Listener for onCompleted
chrome.webRequest.onCompleted.addListener(
  request => {
    addOrMergeRecords(request.tabId, {
      recordType: 'network',
      source: 'background',
      ...traverseInformation(structuredClone(request), request?.url),
    });
  },
  { urls: ['<all_urls>'] },
);

// Listener for onBeforeRequest
chrome.webRequest.onBeforeRequest.addListener(
  request => {
    addOrMergeRecords(request.tabId, {
      recordType: 'network',
      source: 'background',
      ...structuredClone(request),
    } as any);
  },
  { urls: ['<all_urls>'] },
  ['requestBody'],
);

// Listener for onBeforeSendHeaders
chrome.webRequest.onBeforeSendHeaders.addListener(
  request => {
    console.log('onBeforeSendHeaders', traverseInformation(structuredClone(request), request?.url));

    addOrMergeRecords(request.tabId, {
      recordType: 'network',
      source: 'background',
      ...traverseInformation(structuredClone(request), request?.url),
    });
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders'],
);
