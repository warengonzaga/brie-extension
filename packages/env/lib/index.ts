import { config } from '@dotenvx/dotenvx';

import { CLI_CEB_ENV } from './const.js';

/**
 * @todo
 * check why CLI_CEB_ENV doesn't work
 */
export const baseEnv =
  config({
    path: `${import.meta.dirname}/../../../../.env`,
  }).parsed ?? {};

export const dynamicEnvValues = {
  CEB_NODE_ENV: baseEnv.CEB_DEV === 'true' ? 'development' : 'production',
} as const;
