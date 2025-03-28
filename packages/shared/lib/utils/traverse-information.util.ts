import { redactSensitiveInfo } from './redact-sensitive-info.util';

/**
 * Utility to traverse information, accepting an array of key-value pairs, an object with key-value pairs,
 * or an array of objects with key-value pairs.
 * Redacts sensitive information if not in a production environment.
 *
 * @param {([string, string][] | Record<string, string> | Record<string, string>[])} information - The information to traverse.
 * Can be an array of key-value pairs, an object with key-value pairs, or an array of objects with key-value pairs.
 * @returns {Record<string, string>} - The traversed information as an object with key-value pairs.
 */
export const traverseInformation = (
  information: [string, string][] | Record<string, string> | Record<string, string>[],
  url?: string,
): Record<string, string> => {
  const parsedInformation: Record<string, string> = {};

  if (Array.isArray(information)) {
    if (information.length > 0 && typeof information[0] === 'object' && !Array.isArray(information[0])) {
      // Handle array of objects with key-value pairs
      information.forEach(obj => {
        Object.entries(obj).forEach(([key, value]) => {
          (parsedInformation as any)[key] = redactSensitiveInfo(key, value, url);
        });
      });
    } else {
      // Handle array of key-value pairs
      information.forEach(([key, value]: any) => {
        (parsedInformation as any)[key] = redactSensitiveInfo(key, value, url);
      });
    }
  } else {
    // Handle object with key-value pairs
    Object.entries(information).forEach(([key, value]) => {
      (parsedInformation as any)[key] = redactSensitiveInfo(key, value, url);
    });
  }

  return parsedInformation;
};
