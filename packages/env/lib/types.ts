import type { dynamicEnvValues } from './index.js';

interface ICebEnv {
  readonly CEB_NAME: string;
  readonly CEB_API_BASE_URL: string;
  readonly CEB_APP_BASE_URL: string;
}

interface ICebCliEnv {
  readonly CLI_CEB_ENV: string;
  readonly CLI_CEB_DEV: string;
  readonly CLI_CEB_FIREFOX: string;
}

export type IEnv = ICebEnv & ICebCliEnv & typeof dynamicEnvValues;
