import type { IPagination, IProject } from '@extension/shared';
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '../../services';

export const projectsPrivateAPI = createApi({
  reducerPath: 'projects-private',
  tagTypes: ['PROJECTS', 'PROJECT'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    getProjects: build.query<{ items: IProject[]; total: number; hasItems: boolean }, IPagination>({
      providesTags: ['PROJECTS'],
      query: params => ({
        url: '/projects',
        params,
      }),
    }),

    createProject: build.mutation<IProject, Partial<IProject>>({
      invalidatesTags: ['PROJECTS'],
      query: body => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
    }),

    getProjectById: build.query<IProject, { id: string }>({
      providesTags: ['PROJECT'],
      query: ({ id }) => ({
        url: `/projects/${id}`,
      }),
    }),
  }),
});
