import type { AuthMethod } from '../constants';

export interface AuthPayload {
  authMethod: AuthMethod;
  value: string;
}

export interface LoginPayload extends AuthPayload {
  password: string;
}
