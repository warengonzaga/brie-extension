import { trackEvent } from './events.interceptor';

// History API interception
export const historyApiInterceptor = () => {
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    trackEvent({ url: args[2], event: 'Navigate', method: 'pushState' });
    originalPushState.apply(history, args);
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    trackEvent({ url: args[2], event: 'Navigate', method: 'replaceState' });
    originalReplaceState.apply(history, args);
  };

  window.addEventListener('popstate', () => {
    trackEvent({ event: 'Navigate', url: window.location.href, method: 'popstate' });
  });
};
