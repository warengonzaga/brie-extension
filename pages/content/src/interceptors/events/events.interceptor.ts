import { findClickableParent, getElementDescription, getSystemInfo, isClickableElement } from '@src/utils';
import { historyApiInterceptor } from './history.interceptor';

// Track an event
export const trackEvent = ({ target, ...others }: any) => {
  const description = getElementDescription(target);
  const timestamp = Date.now();

  window.postMessage(
    {
      type: 'ADD_RECORD',
      payload: {
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
      },
    },
    '*',
  );
};

export const interceptEvents = () => {
  let interactionStarted = false;

  // Activate tracking only after the user interacts with the page
  const activateTracking = () => {
    if (interactionStarted) return;

    interactionStarted = true;
  };

  // Track the event data
  const trackClickEvent = (target, activationMethod) => {
    trackEvent({
      event: activationMethod,
      url: window.location.href,
      target,
    });
  };

  // DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    trackEvent({ event: 'DOMContentLoaded', url: window.location.href });
  });

  window.addEventListener('load', async () => {
    const systemInfo = await getSystemInfo();

    trackEvent({ event: 'PageLoaded' });

    trackEvent({
      ...systemInfo,
      event: 'metadata',
      rowTimestamp: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      url: document.location.href,
      window: { width: window.innerWidth, height: window.innerHeight },
      screen: { width: window.screen.width, height: window.screen.height },
    });
  });

  document.addEventListener('mouseover', ({ target }) => {
    if (!interactionStarted) return;

    trackEvent({
      event: 'MouseOver',
      url: window.location.href,
      target,
    });
  });

  document.addEventListener('change', ({ target }) => {
    const tag = target?.tagName;
    if (!interactionStarted || !tag) return;

    if (['SELECT', 'INPUT'].includes(tag)) {
      const inputType = target.type;

      if (['checkbox', 'radio'].includes(inputType)) {
        trackEvent({
          event: 'InputChange',
          inputType,
          value: target.checked,
          url: window.location.href,
          target,
        });
      } else if (inputType === 'select-one') {
        trackEvent({
          event: 'InputChange',
          inputType: 'select',
          value: target.value,
          url: window.location.href,
          target,
        });
      }
    }
  });

  // window.addEventListener('beforeunload', () => {
  //   trackEvent({ event: 'BeforeUnload', url: window.location.href });
  // });

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

    if (event.metaKey || event.ctrlKey || event.altKey) {
      trackEvent({
        event: 'KeyboardShortcut',
        keys: [event.ctrlKey && 'Ctrl', event.metaKey && 'Meta', event.altKey && 'Alt', event.key]
          .filter(Boolean)
          .join('+'),
        url: window.location.href,
        target: document.activeElement,
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

      const contentEditableValue = target instanceof Element && target?.getAttribute('contenteditable');
      const isContentEditable = contentEditableValue !== null && contentEditableValue !== 'false';

      if (['INPUT', 'TEXTAREA'].includes(tagName) || isContentEditable) {
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

  historyApiInterceptor();
};
