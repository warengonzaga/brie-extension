import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { UserAndTokensResponse } from '@extension/shared';
import { API_BASE_URL } from '@extension/env';

export const authPublicAPI = createApi({
  reducerPath: 'authPublic',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: build => ({
    loginGuest: build.mutation<UserAndTokensResponse, { uuid: string }>({
      query: body => ({
        url: '/auth/login/guest',
        method: 'POST',
        body,
      }),
    }),
  }),
});
