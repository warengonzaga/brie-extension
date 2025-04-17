import { REDACTED_KEYWORD, sensitivePatterns } from '../constants/index.js';
import { isNonProduction } from './is-non-production.util.js';

/**
 * Redacts sensitive information from a given key-value pair.
 * @param key - The key associated with the value.
 * @param value - The value to be redacted if sensitive.
 * @param url - (Optional) The URL to determine if the environment is non-production.
 * @returns The redacted or original value.
 */
export const redactSensitiveInfo = (key: string, value: unknown, url?: string): unknown => {
  // Helper to check if a key matches any sensitive pattern
  const isSensitiveKey = (k: string): boolean => sensitivePatterns.some(pattern => pattern.test(k));

  // Helper to recursively redact keys in objects
  const redactObject = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const redactedObj: Record<string, unknown> = { ...obj };
    for (const [k, v] of Object.entries(redactedObj)) {
      redactedObj[k] = isSensitiveKey(k) ? REDACTED_KEYWORD : redactObject(v);
    }
    return redactedObj;
  };

  // Check if the value is JSON (object or stringified)
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (typeof parsed === 'object' && parsed !== null) {
      return isNonProduction(url) ? value : JSON.stringify(redactObject(parsed));
    }
  } catch {
    // Not JSON, continue with string logic
  }

  // Redact plain strings
  return !isNonProduction(url) && isSensitiveKey(key) ? REDACTED_KEYWORD : value;
};
