import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/auth';
import { tokenStorage } from '@/lib/tokenStorage';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  // Rehydrate tokens on page load so a refresh doesn't log the user out;
  // `user` itself is refetched via RTK Query once a token is present.
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsSet: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    /** Populates `user` alone, e.g. from GET /me — leaves tokens untouched. */
    userSet: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    /** Swaps in a freshly refreshed access token; the refresh token isn't rotated, so it's left as-is. */
    accessTokenRefreshed: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      tokenStorage.setAccessToken(action.payload);
    },
    loggedOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      tokenStorage.clear();
    },
  },
});

export const { credentialsSet, userSet, accessTokenRefreshed, loggedOut } = authSlice.actions;
export default authSlice.reducer;
