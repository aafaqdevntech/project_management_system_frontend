import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { env } from '@/lib/env';
import { accessTokenRefreshed, loggedOut } from '@/features/auth/authSlice';

const authenticatedBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Dedicated instance for calling POST /auth/refresh itself — deliberately
 * unauthenticated (the refresh token travels in the body, not a Bearer
 * header) and never routed back through `baseQueryWithReauth`, so a failed
 * refresh can't recursively trigger another refresh attempt.
 */
const refreshBaseQuery = fetchBaseQuery({ baseUrl: env.apiBaseUrl });

interface RefreshResponse {
  access_token: string;
}

function isAuthEndpoint(args: string | FetchArgs): boolean {
  const url = typeof args === 'string' ? args : args.url;
  return url === 'auth/login' || url === 'auth/refresh';
}

/**
 * Wraps the authenticated base query so a 401 triggers one attempt to
 * refresh the access token (POST /auth/refresh) and retry the original
 * request. Logs the user out if there's no refresh token to use, or if the
 * refresh call itself fails — a 401 on `auth/login` (wrong credentials) is
 * left alone, since that isn't a stale-token situation.
 *
 * Concurrent requests aren't coordinated with a lock — if several calls 401
 * at once, each independently refreshes. Harmless since the refresh token
 * isn't rotated (every attempt just yields a new access token), just
 * slightly wasteful; revisit with a mutex if that becomes a real problem.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await authenticatedBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && !isAuthEndpoint(args)) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (!refreshToken) {
      api.dispatch(loggedOut());
      return result;
    }

    const refreshResult = await refreshBaseQuery(
      { url: 'auth/refresh', method: 'POST', body: { refresh_token: refreshToken } },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { access_token } = refreshResult.data as RefreshResponse;
      api.dispatch(accessTokenRefreshed(access_token));
      result = await authenticatedBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(loggedOut());
    }
  }

  return result;
};
