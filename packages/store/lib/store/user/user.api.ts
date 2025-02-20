import { createApi } from '@reduxjs/toolkit/query/react';

import type { User } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const userAPI = createApi({
  reducerPath: 'user',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ME'],
  endpoints: build => ({
    getUserDetails: build.query<User, void>({
      query: () => ({
        url: '/users/me',
      }),
      providesTags: () => ['ME'],
    }),
  }),
});
