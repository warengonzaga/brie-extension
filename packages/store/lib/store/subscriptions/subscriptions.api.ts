import { baseQueryWithReauth } from '../../services/index.js';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { Subscription } from '@extension/shared';

export const subscriptionsAPI = createApi({
  reducerPath: 'subscriptions',
  tagTypes: ['SUBSCRIPTIONS'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    getSubscriptionById: build.query<Subscription, { id: string }>({
      providesTags: ['SUBSCRIPTIONS'],
      query: ({ id }) => ({
        url: `/subscriptions/${id}`,
      }),
    }),
  }),
});
