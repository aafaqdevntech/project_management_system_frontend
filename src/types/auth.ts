/**
 * The three roles a user account can hold. Every route guard and
 * conditional UI check in the app is expected to key off this union.
 */
export type UserRole = 'admin' | 'team_lead' | 'member';

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  image_url: string | null;
}

export interface EmploymentDetail {
  id: number;
  user_id: number;
  team_id: number | null;
  role: UserRole;
  job_position: string;
  joined_at: string;
}

/**
 * Shape of the `user` object returned by the backend (login, /me, ...).
 * `profile`/`employment_detail` are null for an account that hasn't been
 * fully set up yet — e.g. right after creation via the Add User form,
 * before an admin assigns a role/team/profile info (confirmed live: a
 * freshly created user's GET /users/{id} returns both as null).
 */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  profile: UserProfile | null;
  employment_detail: EmploymentDetail | null;
}
