import { createApi } from '@reduxjs/toolkit/query/react';

import type { IPagination, ISpace } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const spacesAPI = createApi({
  reducerPath: 'spaces',
  tagTypes: ['SPACES'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    createSpaces: build.mutation<ISpace[], Partial<any>>({
      invalidatesTags: ['SPACES'],
      query: body => ({
        url: '/spaces',
        method: 'POST',
        body,
      }),
    }),

    getSpaces: build.query<{ items: ISpace[]; total: number }, IPagination>({
      providesTags: ['SPACES'],
      query: params => ({
        url: '/spaces',
        params,
      }),
    }),
  }),
});
