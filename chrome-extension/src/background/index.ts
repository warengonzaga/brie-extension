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
