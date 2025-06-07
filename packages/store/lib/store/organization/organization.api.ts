import { baseQueryWithReauth } from '../../services/index.js';
import { createApi } from '@reduxjs/toolkit/query/react';
import type { Organization } from '@extension/shared';

export const organizationAPI = createApi({
  reducerPath: 'organization',
  tagTypes: ['ORGANIZATION'],
  baseQuery: baseQueryWithReauth,
  endpoints: build => ({
    getOrganizationById: build.query<Organization, void>({
      providesTags: ['ORGANIZATION'],
      query: () => ({
        url: '/users/organization',
      }),
    }),
  }),
});
