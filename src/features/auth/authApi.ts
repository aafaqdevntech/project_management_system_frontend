import { baseApi } from '@/app/api/baseApi';
import type { AuthUser } from '@/types/auth';
import type { LoginFormValues } from '@/schemas/auth.schema';

interface LoginResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

interface MeResponse {
  user: AuthUser;
}

/**
 * Auth endpoints injected into the shared `baseApi` instance so they share
 * its cache/middleware rather than creating a separate API slice.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginFormValues>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    // Resolves the current user from the access token; used on app load to
    // rehydrate `state.auth.user` after a refresh, since only the tokens
    // (not the user) are persisted to localStorage.
    getMe: builder.query<AuthUser, void>({
      query: () => 'me',
      // Unwraps `{ user: {...} }` so callers get AuthUser directly, same as
      // the `login` mutation's already-destructured `result.user`.
      transformResponse: (response: MeResponse) => response.user,
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
