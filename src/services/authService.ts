import { axiosClient } from '@/api/axiosClient';
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

export async function login(credentials: LoginFormValues): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>('auth/login', credentials);
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await axiosClient.get<MeResponse>('me');
  return data.user;
}
