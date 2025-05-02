/* eslint-disable @typescript-eslint/no-explicit-any */
import { sensitiveKeywordsPatterns } from '../constants/sensitive-keywords.constants.js';
import { REDACTED_KEYWORD } from '../constants/redacted-keyword.constants.js';
import { sensitivePatterns } from '../constants/sensitive-patterns.constants.js';
import { isNonProduction } from './is-non-production.util.js';

const redactSkipCache = new Map<string, boolean>();

/**
 * Allows external code to register custom redaction patterns.
 */
export const registerCustomRedactionPattern = (pattern: RegExp, groupIndex?: number) => {
  sensitivePatterns.push({ pattern, groupIndex });
};

/**
 * Handle context-based pairs like { name: 'cvv', value: '123' }
 */
const shouldRedactByNameValueContext = (obj: any): boolean => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.value === 'string' &&
    sensitiveKeywordsPatterns.some(({ pattern }) => pattern.test(obj.name))
  );
};

/**
 * Redacts sensitive info in a string using regex patterns.
 */
const safeRedact = (value: string): string => {
  let result = value;

  for (const { pattern, groupIndex } of sensitivePatterns) {
    result = result.replace(pattern, (...args) => {
      if (groupIndex !== undefined && args[groupIndex]) {
        const fullMatch = args[0];
        const sensitivePart = args[groupIndex];
        return fullMatch.replace(sensitivePart, REDACTED_KEYWORD);
      }
      return REDACTED_KEYWORD;
    });
  }

  return result;
};

/**
 * Internal recursive function that uses a single precomputed redaction flag.
 */
const deepRedactInternal = (input: any, shouldSkipRedaction: boolean): any => {
  if (shouldSkipRedaction) return input;

  if (typeof input !== 'object' && typeof input !== 'string') return input;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(input);
        return deepRedactInternal(parsed, shouldSkipRedaction);
      } catch {
        return safeRedact(input);
      }
    }
    return safeRedact(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => deepRedactInternal(item, shouldSkipRedaction));
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    // Case 1: nested { name: 'token', value: '...' }
    if (key === 'value' && typeof value === 'string' && shouldRedactByNameValueContext(input)) {
      result[key] = REDACTED_KEYWORD;
      continue;
    }

    // Case 2: direct key match like { token: '...' }
    if (
      typeof key === 'string' &&
      typeof value === 'string' &&
      sensitiveKeywordsPatterns.some(({ pattern }) => pattern.test(key))
    ) {
      result[key] = REDACTED_KEYWORD;
      continue;
    }

    // Default recursion
    result[key] = deepRedactInternal(value, shouldSkipRedaction);
  }

  return result;
};

/**
 * Deeply redacts sensitive information from any object, array, or string.
 * Redaction mode is determined once per top-level object using its UUID.
 */
export const deepRedactSensitiveInfo = (input: any, url?: string): any => {
  let shouldSkipRedaction = false;

  if (input && typeof input === 'object' && input.uuid) {
    const cached = redactSkipCache.get(input.uuid);
    if (cached !== undefined) {
      shouldSkipRedaction = cached;
    } else {
      shouldSkipRedaction = isNonProduction(url);
      redactSkipCache.set(input.uuid, shouldSkipRedaction);
    }
  } else {
    shouldSkipRedaction = isNonProduction(url);
  }

  return deepRedactInternal(input, shouldSkipRedaction);
};
