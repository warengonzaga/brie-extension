import { startScreenshotCapture } from './screenshots';

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

const s = document.createElement('script');
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('content/extend.iife.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
