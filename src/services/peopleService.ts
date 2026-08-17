import { axiosClient } from '@/api/axiosClient';
import type { AuthUser, EmploymentDetail, UserProfile } from '@/types/auth';
import type { UserListItem, CreateUserResponse } from '@/types/users';
import type { CreateUserFormValues } from '@/schemas/createUser.schema';
import type { ProfileFormValues } from '@/schemas/profile.schema';
import type { EmploymentFormValues } from '@/schemas/employment.schema';

export async function getUsers(): Promise<UserListItem[]> {
  const { data } = await axiosClient.get<UserListItem[]>('users');
  return data;
}

export async function getUser(id: number): Promise<AuthUser> {
  const { data } = await axiosClient.get<AuthUser>(`users/${id}`);
  return data;
}

export async function createUser(body: CreateUserFormValues): Promise<CreateUserResponse> {
  const { data } = await axiosClient.post<CreateUserResponse>('users', body);
  return data;
}

export async function createProfile(userId: number, body: ProfileFormValues): Promise<UserProfile> {
  const { data } = await axiosClient.post<UserProfile>(`users/${userId}/profile`, body);
  return data;
}

export async function createEmploymentDetail(
  userId: number,
  body: EmploymentFormValues,
): Promise<EmploymentDetail> {
  const { data } = await axiosClient.post<EmploymentDetail>(`users/${userId}/employment_detail`, body);
  return data;
}

export async function updateEmploymentDetail(
  userId: number,
  body: Partial<Pick<EmploymentFormValues, 'role' | 'job_position'>>,
): Promise<EmploymentDetail> {
  const { data } = await axiosClient.patch<EmploymentDetail>(`users/${userId}/employment_detail`, body);
  return data;
}
