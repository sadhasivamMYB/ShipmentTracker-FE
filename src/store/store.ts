import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import { templateApi } from '../services/templateApi';
import { appApi } from '../services/appApi';

// Middleware to handle 401/403 errors globally
export const rtkQueryErrorLogger: Middleware = (api) => (next) => (action: any) => {
  if (isRejectedWithValue(action)) {
    if (action.payload?.status === 401 || action.payload?.status === 403) {
      // Dispatch logout action on unauthorized
      api.dispatch(logout());
      window.dispatchEvent(new CustomEvent('auth-error', { detail: action.payload.status }));
    }
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [templateApi.reducerPath]: templateApi.reducer,
    [appApi.reducerPath]: appApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(templateApi.middleware, appApi.middleware, rtkQueryErrorLogger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
