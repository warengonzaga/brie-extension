import { CLICKABLE_TAGS } from '@src/constants';

// Check if an element is "clickable"
export const isClickableElement = element => {
  return (
    CLICKABLE_TAGS.includes(element.tagName) ||
    element.hasAttribute('role') || // Covers elements with ARIA roles (e.g., role="button")
    typeof element.onclick === 'function' // Covers elements with onclick event listeners
  );
};
