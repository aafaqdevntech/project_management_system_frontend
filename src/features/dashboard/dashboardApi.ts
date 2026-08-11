import { baseApi } from '@/app/api/baseApi';
import type { MyCountsResponse } from '@/types/dashboard';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCounts: builder.query<MyCountsResponse, void>({
      query: () => 'me/counts',
    }),
  }),
});

export const { useGetMyCountsQuery } = dashboardApi;
