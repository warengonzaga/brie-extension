import { cleanup, startScreenshotCapture } from '@src/capture';

export const addRuntimeEventListeners = () => {
  // Listen for runtime messages
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'START_SCREENSHOT') {
      // Call the function to initiate the screenshot capture process

      startScreenshotCapture();
    }

    if (msg.action === 'EXIT_CAPTURE') {
      cleanup();
    }

    if (msg.action === 'CLOSE_MODAL') {
      window.dispatchEvent(new CustomEvent('CLOSE_MODAL'));
    }
  });
};
