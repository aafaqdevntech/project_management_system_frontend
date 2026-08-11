import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/app/api/baseQueryWithReauth';

/**
 * Single RTK Query API instance for the whole app. Every feature (auth,
 * projects, teams, issues, tasks, ...) injects its own endpoints into this
 * instance via `baseApi.injectEndpoints` rather than creating separate
 * `createApi` calls, so all server state shares one cache and one set of
 * tag types.
 *
 * `baseQueryWithReauth` handles auth: it attaches the access token to every
 * request and transparently refreshes + retries on a 401 (see that file).
 *
 * Add each new entity's tag name to `tagTypes` below when its endpoints
 * are introduced, so mutations can invalidate the right queries.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User'],
  endpoints: () => ({}),
});
