import { isNonProduction } from './is-non-production.util';
import { redactSensitiveInfo } from './redact-sensitive-info.util';

// Utility to parse headers
export const parseHeaders = (headers: [string, string][]): Record<string, string> => {
  const parsedHeaders: Record<string, string> = {};

  headers.forEach(([key, value]) => {
    parsedHeaders[key] = isNonProduction() ? value : redactSensitiveInfo(key, value);
  });

  return parsedHeaders;
};
