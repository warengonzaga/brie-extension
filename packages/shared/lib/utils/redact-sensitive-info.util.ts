import { REDACTED_KEYWORD, sensitivePatterns } from '../constants';
import { isNonProduction } from './is-non-production.util';

export const redactSensitiveInfo = (key, value, url) => {
  // Helper to check if a key matches any sensitive pattern
  const isSensitiveKey = k => sensitivePatterns.some(pattern => pattern.test(k));

  // Helper to recursively redact keys in objects
  const redactObject = obj => {
    if (typeof obj !== 'object' || obj === null) return obj;
    for (const [k, v] of Object.entries(obj)) {
      obj[k] = isSensitiveKey(k) ? REDACTED_KEYWORD : redactObject(v); // Recursively process nested objects
    }
    return obj;
  };

  // Check if the value is JSON (object or stringified)
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (typeof parsed === 'object') {
      return isNonProduction(url) ? value : JSON.stringify(redactObject(parsed));
    }
  } catch {
    // Not JSON, continue with string logic
  }

  // Redact plain strings
  return !isNonProduction(url) && isSensitiveKey(key) ? REDACTED_KEYWORD : value;
};
