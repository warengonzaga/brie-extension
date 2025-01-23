import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { authReducer } from './auth';
import { issuesPrivateAPI, issuesPublicAPI, issuesReducer } from './issues';
import { overviewAPI } from './overview';
import { projectsPrivateAPI, projectsPublicAPI, projectsReducer } from './projects';
import { spacesAPI } from './spaces';
import { subscriptionsAPI } from './subscriptions';
import { userAPI } from './user';

const rootReducer = combineReducers({
  authReducer,

  [userAPI.reducerPath]: userAPI.reducer,

  [overviewAPI.reducerPath]: overviewAPI.reducer,

  [issuesPrivateAPI.reducerPath]: issuesPrivateAPI.reducer,
  [issuesPublicAPI.reducerPath]: issuesPublicAPI.reducer,
  issuesReducer,

  [spacesAPI.reducerPath]: spacesAPI.reducer,

  [projectsPrivateAPI.reducerPath]: projectsPrivateAPI.reducer,
  [projectsPublicAPI.reducerPath]: projectsPublicAPI.reducer,
  projectsReducer,

  [subscriptionsAPI.reducerPath]: subscriptionsAPI.reducer,
});

const setupStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware()
        .concat(userAPI.middleware)
        .concat(overviewAPI.middleware)
        .concat(projectsPrivateAPI.middleware)
        .concat(projectsPublicAPI.middleware)
        .concat(issuesPrivateAPI.middleware)
        .concat(issuesPublicAPI.middleware)
        .concat(spacesAPI.middleware)
        .concat(subscriptionsAPI.middleware),
  });

export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
