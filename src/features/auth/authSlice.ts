import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/auth';
import type { LoginFormValues } from '@/schemas/auth.schema';
import { tokenStorage } from '@/lib/tokenStorage';
import { getApiErrorMessage } from '@/lib/apiError';
import * as authService from '@/services/authService';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  // Rehydrate tokens on page load so a refresh doesn't log the user out;
  // `user` itself is refetched via `fetchCurrentUser` once a token is present.
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginFormValues, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  },
);

/** Resolves the current user from the access token; used on app load to
 * rehydrate `state.auth.user` after a refresh, since only the tokens (not
 * the user) are persisted to localStorage. */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_: void, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { user, access_token, refresh_token } = action.payload;
        state.user = user;
        state.accessToken = access_token;
        state.refreshToken = refresh_token;
        tokenStorage.setTokens(access_token, refresh_token);
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { accessTokenRefreshed, loggedOut } = authSlice.actions;
export default authSlice.reducer;
