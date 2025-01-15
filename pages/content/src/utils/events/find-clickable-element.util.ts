import { isClickableElement } from './element-clickable.util';
import { findReactProp } from './find-react-prop.util';

// Function to find the immediate clickable parent of the target
export const findClickableParent = element => {
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
