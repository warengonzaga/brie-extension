import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { IPagination } from '@extension/shared';

const initialState: { filters: Partial<IPagination> } = {
  filters: {} as Partial<IPagination>,
};

export const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<IPagination>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state, action: PayloadAction<string | undefined>) {
      if (action.payload === 'status') {
        delete state.filters.status;
        return;
      }

      if (action.payload === 'q') {
        delete state.filters.q;
        return;
      }

      if (action.payload === 'priority') {
        delete state.filters.priority;
        return;
      }

      if (action.payload === 'projectId') {
        delete state.filters.projectId;
        return;
      }

      state.filters = {};
    },
  },
  extraReducers: () => {},
});
