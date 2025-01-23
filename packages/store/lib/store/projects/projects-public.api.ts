import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { IProject } from '@extension/shared';
import { BASE_URL } from '@extension/shared';

export const projectsPublicAPI = createApi({
  reducerPath: 'projects-public',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: build => ({
    getProjectPublicById: build.query<IProject, { id: string }>({
      query: ({ id }) => ({
        url: `/projects/public/${id}`,
      }),
    }),
  }),
});
