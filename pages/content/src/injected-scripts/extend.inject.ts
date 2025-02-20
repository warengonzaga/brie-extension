export const injectExtendScript = () => {
  const injectedScript = document.createElement('script');
  // must be listed in web_accessible_resources in manifest.json
  injectedScript.src = chrome.runtime.getURL('content/extend.iife.js');
  injectedScript.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(injectedScript);
};
