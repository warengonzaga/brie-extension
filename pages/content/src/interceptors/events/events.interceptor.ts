const DEBOUNCE_TIME = 1000;
const CLICKABLE_TAGS = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];

export const interceptEvents = () => {
  let interactionStarted = false;
  // Queue to batch events
  let eventQueue = [];
  let batchTimeout = null;

  // Activate tracking only after the user interacts with the page
  const activateTracking = () => {
    if (interactionStarted) return;

    interactionStarted = true;
  };

  // Send events in a batch to the background script
  const batchSendEvents = () => {
    if (!eventQueue.length) return;

    window.postMessage(
      {
        type: 'ADD_RECORD',
        payload: eventQueue,
      },
      '*',
    );

    eventQueue = [];
  };

  // Schedule a batch send
  const scheduleBatchSend = () => {
    if (!batchTimeout) {
      batchTimeout = setTimeout(() => {
        batchSendEvents();
        batchTimeout = null;
      }, DEBOUNCE_TIME); // Adjust timing as needed
    }
  };

  const getOSInfo = () => {
    if (navigator?.userAgentData) {
      const userAgentData = navigator.userAgentData;
      const brands = userAgentData.brands.map(b => `${b.brand} ${b.version}`).join(', ');
      const platform = userAgentData.platform; // E.g., 'Windows', 'macOS', 'Linux', 'Android'

      return { platform, brands };
    }

    // Fallback for browsers that don't support `userAgentData`
    const userAgent = navigator.userAgent;
    const platformMatch = userAgent.match(/\(([^)]+)\)/);
    const platform = platformMatch ? platformMatch[1] : 'Unknown';

    return { platform, brands: userAgent };
  };

  // Function to get description from an element (supports label, input, etc.)
  const getDescription = element => {
    let description = null;

    if (!(element instanceof HTMLElement) || ['BODY', 'DIV'].includes(element?.tagName)) {
      return description; // Ensure element is a valid DOM element
    }

    // Check if the element is wrapped inside a label
    const label = element?.closest('label');

    if (label) {
      description = label.innerText || label.getAttribute('aria-label');
    }

    // Check for relevant ARIA attributes directly on the element
    if (!description) {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      const ariaRole = element.getAttribute('role');

      // Combine the ARIA attributes into a descriptive string
      description = ariaLabel || ariaDescribedBy || ariaRole;
    }

    // If no ARIA attributes or labels are found, fallback to the element's inner text or a generic description
    if (!description) {
      description = element.innerText || element.getAttribute('title');
    }

    return description;
  };

  const findReactProp = element => {
    // Get all property names on the element
    const props = Object.keys(element);

    // Find the property that matches the React Fiber naming pattern
    const reactProp = props.find(prop => prop.startsWith('__reactProps$'));

    // Return the value of the matching property, or null if not found
    //? element[reactProp] : null;
    return reactProp;
  };

  // Track an event
  const trackEvent = ({ target, ...others }: any) => {
    const description = getDescription(target);
    const timestamp = Date.now();

    eventQueue.push({
      type: 'event',
      recordType: 'events',
      source: 'client',
      timestamp,
      ...others,
      ...(description ? { description } : {}),
      ...(target?.tagName ? { tagName: target?.tagName } : {}),
      ...(target?.event ? { event: target?.event } : {}),
      ...(target?.url ? { url: target?.url } : {}),
      ...(target?.id ? { id: target?.id } : {}),
      ...(target?.className ? { className: target?.className } : {}),
      ...(target?.href ? { href: target?.href } : {}),
      ...(target?.role ? { role: target?.role } : {}),
      ...(target?.value ? { value: target?.value } : {}),
      ...(target?.size ? { size: target?.size } : {}),
      ...(target?.action ? { action: target?.action } : {}),
      ...(target?.method ? { method: target?.method } : {}),
      ...(target?.disabled ? { disabled: target?.disabled } : {}),
      ...(target && target['data-testid'] ? { dataTestid: target['data-testid'] } : {}),
      ...(target && target['dataTestid'] ? { dataTestid: target['dataTestid'] } : {}),
      ...(target && target['aria-label'] ? { ariaLabel: target['aria-label'] } : {}),
      ...(target && target['ariaLabel'] ? { ariaLabel: target['ariaLabel'] } : {}),
      ...(target && target['aria-describedby'] ? { ariaDescribedby: target['aria-describedby'] } : {}),
      ...(target && target['ariaDescribedby'] ? { ariaDescribedby: target['ariaDescribedby'] } : {}),
      ...(target && target['contenteditable'] ? { contentEditable: target['contenteditable'] } : {}),
      ...(target?.label ? { label: target?.label } : {}),
      ...(target?.role ? { role: target?.role } : {}),
      ...(target?.title ? { title: target?.title } : {}),
      ...(target?.target ? { target: target?.target } : {}),
      ...(target?.type ? { inputType: target?.type } : {}),
      ...(target?.textContent ? { textContent: target?.textContent } : {}),
    });

    scheduleBatchSend();
  };

  // Track the event data
  const trackClickEvent = (target, activationMethod) => {
    trackEvent({
      event: activationMethod,
      url: window.location.href,
      target,
    });
  };

  // Check if an element is "clickable"
  const isClickableElement = element => {
    return (
      CLICKABLE_TAGS.includes(element.tagName) ||
      element.hasAttribute('role') || // Covers elements with ARIA roles (e.g., role="button")
      typeof element.onclick === 'function' // Covers elements with onclick event listeners
    );
  };

  // Function to find the immediate clickable parent of the target
  const findClickableParent = element => {
    let current = element.parentElement;
    let depth = 0; // Track the number of levels traversed

    while (current && depth < 3) {
      if (isClickableElement(current)) {
        const reactProp = findReactProp(current);

        return reactProp ? current[reactProp] : current; // Return the first clickable ancestor found
      }
      current = current.parentElement; // Move up to the next parent
      depth++; // Increment the depth counter
    }

    return null; // No clickable parent found within 3 levels
  };

  // DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    trackEvent({ event: 'DOMContentLoaded', url: window.location.href });
  });

  window.addEventListener('load', () => {
    const osInfo = getOSInfo();

    trackEvent({
      event: 'PageLoaded',
      rowTimestamp: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      os: osInfo.platform,
      browser: osInfo.brands,
      url: document.location.href,
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      screenSize: { width: window.screen.width, height: window.screen.height },
    });
  });

  window.addEventListener('beforeunload', () => {
    trackEvent({ event: 'BeforeUnload', url: window.location.href });
  });

  window.addEventListener('resize', () => {
    trackEvent({ event: 'Resize', size: { width: window.innerWidth, height: window.innerHeight } });
  });

  //   document.addEventListener('input', ({ target }) => {
  //     // TODO: check if is on change or final
  //     // if (target.type === "password" || target.type === "email" || target.type === "tel") {
  //     //     return; // Do not track sensitive data
  //     //   }
  //
  //     trackEvent({
  //       event: 'InputChanged',
  //       element: target?.tagName || null,
  //       value: target?.value || null,
  //     });
  //   });

  // Handle Keydown Events
  document.addEventListener('keydown', event => {
    activateTracking();

    const target = document.activeElement; // The focused element

    if (!target?.tagName) return;

    if (['Enter', ' '].includes(event.key)) {
      if (isClickableElement(target)) {
        // event.preventDefault(); // Prevent default spacebar scroll behavior
        trackClickEvent(target, 'KeyActivation');
      }
    }

    if (event.key === 'Tab') {
      trackEvent({
        event: 'TabNavigation',
        url: window.location.href,
        target,
      });
    }
  });

  // Handle Click Events
  document.addEventListener('click', event => {
    activateTracking();

    if (isClickableElement(event.target)) {
      trackClickEvent(event.target, 'MouseClick');

      return;
    }

    const clickableElement = findClickableParent(event.target);
    if (clickableElement) {
      trackClickEvent(clickableElement, 'MouseClick');
    }
  });

  // Capture double-click events
  //   document.addEventListener('dblclick', ({ target }) => {
  //     activateTracking();

  //     trackEvent({
  //       event: 'DoubleClick',
  //       url: window.location.href,
  //       target,
  //     });
  //   });

  // Capture form submissions
  document.addEventListener('submit', event => {
    activateTracking();

    trackEvent({
      event: 'FormSubmit',
      url: window.location.href,
      target: event,
    });
  });

  // Capture input/textarea changes on blur (user leaves the input)
  document.addEventListener(
    'blur',
    ({ target }) => {
      if (!interactionStarted) return; // Skip if tracking not activated

      const tagName = target?.tagName;

      //   if (CLICKABLE_TAGS.includes(tagName))
      //     trackEvent({
      //       event: 'Blur',
      //       url: window.location.href,
      //       element: target?.tagName || null,
      //       elementId: target?.id || null,
      //       elementClass: target?.className || null,
      //     });

      // TODO: check if is on change or final
      // if (target.type === "password" || target.type === "email" || target.type === "tel") {
      //     return; // Do not track sensitive data
      //   }

      if (['INPUT', 'TEXTAREA'].includes(tagName) || !!target?.getAttribute('contenteditable')) {
        trackEvent({
          event: 'InputChange',
          url: window.location.href,
          target,
        });
      }
    },
    true,
  ); // Use the capture phase to ensure blur is detected

  // Detect user interaction via mouse or keyboard (fallback for tracking activation)
  document.addEventListener('mousedown', activateTracking);
  document.addEventListener('focusin', activateTracking, true);

  // History API interception
  const historyApiInterceptor = () => {
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

  historyApiInterceptor();
};
