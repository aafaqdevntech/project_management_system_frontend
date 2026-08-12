import axios, { type AxiosRequestConfig } from 'axios';
import { env } from '@/lib/env';
import { store } from '@/app/store';
import { accessTokenRefreshed, loggedOut } from '@/features/auth/authSlice';

/** Main client — every request/response goes through the interceptors below. */
export const axiosClient = axios.create({ baseURL: env.apiBaseUrl });

/** Plain client for the refresh call itself, so a failed refresh can't recursively trigger another refresh. */
const refreshClient = axios.create({ baseURL: env.apiBaseUrl });

axiosClient.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * On a 401, attempts one silent refresh-and-retry. Logs the user out if
 * there's no refresh token to use, or if the refresh call itself fails — a
 * 401 on `auth/login` (wrong credentials) is left alone, since that isn't a
 * stale-token situation.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isAuthEndpoint = originalRequest?.url === 'auth/login' || originalRequest?.url === 'auth/refresh';

    if (error.response?.status === 401 && originalRequest && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        store.dispatch(loggedOut());
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshClient.post<{ access_token: string }>('auth/refresh', {
          refresh_token: refreshToken,
        });
        store.dispatch(accessTokenRefreshed(data.access_token));
        originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${data.access_token}` };
        return axiosClient(originalRequest);
      } catch {
        store.dispatch(loggedOut());
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
