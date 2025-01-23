import { issuesPrivateAPI } from './issues-private.api';
import { issuesPublicAPI } from './issues-public.api';
import { issuesSlice } from './issues.reducer';

export { issuesPrivateAPI } from './issues-private.api';
export const { useGetIssuesQuery, useLazyGetIssuesQuery, useDeleteIssueByIdMutation, useCreateIssueMutation } =
  issuesPrivateAPI;

export const issuesReducer = issuesSlice.reducer;
export const { setFilters, clearFilters } = issuesSlice.actions;

export { issuesPublicAPI } from './issues-public.api';
export const { useGetIssuePublicByIdQuery } = issuesPublicAPI;
