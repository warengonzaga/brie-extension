import { createSlice } from '@reduxjs/toolkit';

import type { IAuthState, ITokens, IUser } from '@extension/shared';

import { userAPI } from '../user';

const initialState: IAuthState = {
  user: {} as IUser,
  tokens: {} as ITokens,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addMatcher(userAPI.endpoints.getUserDetails.matchFulfilled, (state, { payload }: any) => {
      state.user = payload;
    });
  },
});
