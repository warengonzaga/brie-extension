import { config } from '@dotenvx/dotenvx';

import { CLI_CEB_ENV } from './const.js';

export const baseEnv =
  config({
    path: `${import.meta.dirname}/../../../../.env.${CLI_CEB_ENV}`,
  }).parsed ?? {};

export const dynamicEnvValues = {
  CEB_NODE_ENV: baseEnv.CEB_DEV === 'true' ? 'development' : 'production',
} as const;
