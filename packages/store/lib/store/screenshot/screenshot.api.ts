import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '../../services';

export const screenshotAPI = createApi({
  reducerPath: 'screenshots',
  baseQuery: baseQueryWithReauth,

  endpoints: build => ({
    getFullScreenshot: build.query<any, { url: string }>({
      query: ({ url }) => ({
        url: '/screenshots',
        params: { url },
      }),
    }),
  }),
});
