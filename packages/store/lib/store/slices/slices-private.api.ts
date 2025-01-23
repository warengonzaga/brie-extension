import { createApi } from '@reduxjs/toolkit/query/react';

import type { Slice, Pagination } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const slicesPrivateAPI = createApi({
  reducerPath: 'slices-private',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SLICE', 'SLICES'],
  endpoints: build => ({
    getSlices: build.query<{ items: Slice[]; total: number; hasItems: boolean }, Pagination>({
      providesTags: ['SLICES'],
      query: params => ({
        url: '/slices',
        params,
      }),
      transformResponse: (response: { items: Slice[]; total: number; hasItems: boolean }) => ({
        hasItems: response.hasItems,
        total: response.total,
        items: response.items.map((i: Slice) => ({
          ...i,
          labels: typeof i.labels === 'string' ? JSON.parse(i.labels) : i.labels,
          attachments: i.attachments.map(a => ({
            ...a,
            preview: `${BASE_URL}/uploads/images/slices/${a.externalId}`,
          })),
        })),
      }),
    }),

    createSlice: build.mutation<Slice, Partial<Slice>>({
      invalidatesTags: ['SLICES'],
      query: body => ({
        url: '/slices',
        method: 'POST',
        body,
      }),
    }),

    deleteSliceById: build.mutation<Slice, string>({
      invalidatesTags: ['SLICES'],
      query: id => ({
        url: `/slices/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});
