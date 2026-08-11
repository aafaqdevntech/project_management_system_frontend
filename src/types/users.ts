/**
 * One row of `GET /users` — a flattened list-view summary, distinct from
 * the nested `AuthUser` shape `GET /users/{id}` returns. For a user with no
 * employment_detail record yet (e.g. freshly created via Add User),
 * `image_url`, `team_name`, `role`, `job_position`, and `joined_at` all
 * carry the backend's literal "No record!" sentinel string instead of a
 * real value (confirmed live) — hence `role`/`job_position`/`joined_at`
 * are typed as plain `string`, not `UserRole`/a real date, and every field
 * here needs `normalizeSentinel` (src/lib/sentinel.ts) before use.
 */
export interface UserListItem {
  id: number;
  username: string;
  email: string;
  image_url: string;
  role: string;
  team_name: string;
  job_position: string;
  joined_at: string;
}

/**
 * `POST /users` response — a freshly created account has no profile or
 * employment record yet (those are filled in later via separate actions:
 * update profile, assign team, change role/job position), so this is
 * intentionally not `AuthUser`.
 */
export interface CreateUserResponse {
  id: number;
  username: string;
  email: string;
  profile: null;
  employment_detail: null;
}
