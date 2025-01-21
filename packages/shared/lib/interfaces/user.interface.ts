import type { AuthMethod } from '../constants';

export interface IAuthState {
  user: IUser;
  tokens: ITokens;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUserAndTokensResponse {
  user: IUser;
  tokens: ITokens;
}

export interface IUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
  authMethod: AuthMethod;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarId?: string;
  username: string;
}
