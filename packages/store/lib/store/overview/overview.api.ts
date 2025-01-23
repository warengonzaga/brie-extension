import { createApi } from '@reduxjs/toolkit/query/react';

import type { IPagination } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const overviewAPI = createApi({
  reducerPath: 'overview',
  baseQuery: baseQueryWithReauth,

  endpoints: build => ({
    getOverview: build.query<any, IPagination>({
      query: ({ limit, take, start, end }) => ({
        url: '/overview',
        params: { limit, take, start, end },
      }),
    }),
  }),
});
