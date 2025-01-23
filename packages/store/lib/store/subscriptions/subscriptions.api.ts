import { createApi } from '@reduxjs/toolkit/query/react';

import type { ISubscription } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const subscriptionsAPI = createApi({
  reducerPath: 'subscriptions',
  tagTypes: ['SUBSCRIPTIONS'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    getSubscriptionById: build.query<ISubscription, { id: string }>({
      providesTags: ['SUBSCRIPTIONS'],
      query: ({ id }) => ({
        url: `/subscriptions/${id}`,
      }),
    }),
  }),
});
