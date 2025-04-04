import { baseEnv, dynamicEnvValues } from './lib';
import type { IEnv } from './lib/types';

export * from './lib/const';
export * from './lib';

const env = {
  ...baseEnv,
  ...dynamicEnvValues,
} as IEnv;

export default env;
