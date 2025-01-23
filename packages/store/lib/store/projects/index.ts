import { projectsPrivateAPI } from './projects-private.api';
import { projectsPublicAPI } from './projects-public.api';
import { projectsSlice } from './projects.reducer';

export { projectsPrivateAPI } from './projects-private.api';
export const { useGetProjectsQuery, useCreateProjectMutation, useGetProjectByIdQuery } = projectsPrivateAPI;

export const projectsReducer = projectsSlice.reducer;
export const { setFilters, clearFilters } = projectsSlice.actions;

export { projectsPublicAPI } from './projects-public.api';
export const { useGetProjectPublicByIdQuery } = projectsPublicAPI;
