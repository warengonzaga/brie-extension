import { startScreenshotCapture } from './screenshot';

console.log('content script loaded');

// Listen for runtime messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('On Message Listener: ', msg);

  if (msg.action === 'START_SCREENSHOT') {
    // Call the function to initiate the screenshot capture process
    startScreenshotCapture();
  }

  if (msg.action === 'CLOSE_MODAL') {
    window.dispatchEvent(new CustomEvent('CLOSE_MODAL'));
  }
});
