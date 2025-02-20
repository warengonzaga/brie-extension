import { nonProductionKeywords } from '@src/constants';

// Check if the current environment is non-production
export const isNonProduction = () => {
  const url = window.location.href.toLowerCase();

  return nonProductionKeywords.some(env => url.includes(env));
};
