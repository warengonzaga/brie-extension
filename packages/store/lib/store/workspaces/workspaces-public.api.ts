import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { Workspace } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

export const workspacesPublicAPI = createApi({
  reducerPath: 'workspaces-public',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: build => ({
    getWorkspacePublicById: build.query<Workspace, { id: string }>({
      query: ({ id }) => ({
        url: `/workspaces/public/${id}`,
      }),
    }),
  }),
});
