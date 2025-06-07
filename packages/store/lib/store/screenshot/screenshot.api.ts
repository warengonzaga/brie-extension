import { baseQueryWithReauth } from '../../services/index.js';
import { createApi } from '@reduxjs/toolkit/query/react';

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
