import { axiosClient } from '@/api/axiosClient';
import type { MyCountsResponse } from '@/types/dashboard';

export async function getMyCounts(): Promise<MyCountsResponse> {
  const { data } = await axiosClient.get<MyCountsResponse>('me/counts');
  return data;
}
