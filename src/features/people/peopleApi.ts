import { baseApi } from '@/app/api/baseApi';
import type { AuthUser, EmploymentDetail, UserProfile } from '@/types/auth';
import type { UserListItem, CreateUserResponse } from '@/types/users';
import type { CreateUserFormValues } from '@/schemas/createUser.schema';
import type { ProfileFormValues } from '@/schemas/profile.schema';
import type { EmploymentFormValues } from '@/schemas/employment.schema';

/**
 * All three endpoints return their payload unwrapped — unlike `getMe` in
 * authApi.ts, none needs a `transformResponse`.
 */
export const peopleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserListItem[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    getUser: builder.query<AuthUser, number>({
      query: (id) => `users/${id}`,
      providesTags: ['User'],
    }),
    createUser: builder.mutation<CreateUserResponse, CreateUserFormValues>({
      query: (body) => ({
        url: 'users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    createProfile: builder.mutation<UserProfile, { userId: number; body: ProfileFormValues }>({
      query: ({ userId, body }) => ({
        url: `users/${userId}/profile`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    createEmploymentDetail: builder.mutation<
      EmploymentDetail,
      { userId: number; body: EmploymentFormValues }
    >({
      query: ({ userId, body }) => ({
        url: `users/${userId}/employment_detail`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useCreateProfileMutation,
  useCreateEmploymentDetailMutation,
} = peopleApi;
