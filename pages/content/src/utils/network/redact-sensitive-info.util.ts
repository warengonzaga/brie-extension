import { REDACTED_KEYWORD, sensitivePatterns } from '@src/constants';
import { isNonProduction } from './is-non-production.util';

export const redactSensitiveInfo = (key, value) => {
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
      return isNonProduction() ? value : JSON.stringify(redactObject(parsed));
    }
  } catch {
    // Not JSON, continue with string logic
  }

  // Redact plain strings
  return isSensitiveKey(key) ? REDACTED_KEYWORD : value;
};
