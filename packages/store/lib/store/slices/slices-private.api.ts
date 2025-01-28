import { createApi } from '@reduxjs/toolkit/query/react';

import type { Slice, Pagination } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const attachmentUrlPath = (a: Slice) => {
  const uploadPaths = {
    'image/jpeg': 'images/slices',
    default: 'records',
  };

  const uploadPath = uploadPaths[a.type] || uploadPaths.default;
  return `${BASE_URL}/uploads/${uploadPath}/${a.externalId}`;
};

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
            preview: attachmentUrlPath(a),
          })),
        })),
      }),
    }),

    createSlice: build.mutation<Slice, Partial<{ primary: File; secondary: File; records: File }>>({
      invalidatesTags: ['SLICES'],
      query: body => ({
        url: '/slices',
        method: 'POST',
        body,
      }),
    }),

    deleteSliceById: build.mutation<Slice, string>({
      invalidatesTags: ['SLICES'],
      query: externalId => ({
        url: `/slices/${externalId}`,
        method: 'DELETE',
      }),
    }),
  }),
});
