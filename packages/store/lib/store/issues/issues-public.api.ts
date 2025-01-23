import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IIssue } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

export const issuesPublicAPI = createApi({
  reducerPath: 'issues-public',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: build => ({
    getIssuePublicById: build.query<IIssue, { id: string }>({
      query: ({ id }) => ({
        url: `/issues/public/${id}`,
      }),
      transformResponse: (issue: IIssue) => ({
        ...issue,
        labels: typeof issue.labels === 'string' ? JSON.parse(issue.labels as any) : issue.labels,
        attachments: issue.attachments.map(a => ({
          ...a,
          preview: `${BASE_URL}/uploads/images/issues/${a.externalId}`,
        })),
      }),
    }),
  }),
});
