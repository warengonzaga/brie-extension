import { createApi } from '@reduxjs/toolkit/query/react';

import type { IIssue, IPagination } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

import { baseQueryWithReauth } from '../../services';

export const issuesPrivateAPI = createApi({
  reducerPath: 'issues-private',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ISSUE', 'ISSUES'],
  endpoints: build => ({
    getIssues: build.query<{ items: IIssue[]; total: number; hasItems: boolean }, IPagination>({
      providesTags: ['ISSUES'],
      query: params => ({
        url: '/issues',
        params,
      }),
      transformResponse: (response: { items: IIssue[]; total: number; hasItems: boolean }) => ({
        hasItems: response.hasItems,
        total: response.total,
        items: response.items.map((i: IIssue) => ({
          ...i,
          labels: typeof i.labels === 'string' ? JSON.parse(i.labels as any) : i.labels,
          attachments: i.attachments.map(a => ({
            ...a,
            preview: `${BASE_URL}/uploads/images/issues/${a.externalId}`,
          })),
        })),
      }),
    }),

    createIssue: build.mutation<IIssue, Partial<IIssue>>({
      invalidatesTags: ['ISSUES'],
      query: body => ({
        url: '/issues',
        method: 'POST',
        body,
      }),
    }),

    deleteIssueById: build.mutation<IIssue, string>({
      invalidatesTags: ['ISSUES'],
      query: id => ({
        url: `/issues/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});
