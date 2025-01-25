import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Slice } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

import { attachmentUrlPath } from './slices-private.api';

export const slicesPublicAPI = createApi({
  reducerPath: 'slices-public',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: build => ({
    getPublicSliceById: build.query<Slice, { id: string }>({
      query: ({ id }) => ({
        url: `/slices/public/${id}`,
      }),
      transformResponse: (slice: Slice) => ({
        ...slice,
        labels: typeof slice.labels === 'string' ? JSON.parse(slice.labels) : slice.labels,
        attachments: slice.attachments.map(a => ({
          ...a,
          preview: attachmentUrlPath(a),
        })),
      }),
    }),
  }),
});
