import type { UserRole } from '@/types/auth';
import type { UserListItem } from '@/types/users';
import { normalizeSentinel } from '@/lib/sentinel';

const VALID_ROLES: readonly string[] = ['admin', 'team_lead', 'member'];

/** `UserListItem.role` may be the "No record!" sentinel for an incomplete account. */
export function normalizeRole(role: string): UserRole | null {
  return VALID_ROLES.includes(role) ? (role as UserRole) : null;
}

export type PeopleBucket = 'no_team' | 'admin' | 'team_lead' | 'member';
export type PeopleFilter = 'all' | PeopleBucket;

/** Display order for both the grouped "All" view and the filter tabs. */
export const BUCKET_ORDER: PeopleBucket[] = ['no_team', 'admin', 'team_lead', 'member'];

export const BUCKET_LABELS: Record<PeopleBucket, string> = {
  no_team: 'No team',
  admin: 'Admin',
  team_lead: 'Team leads',
  member: 'Members',
};

export const FILTER_LABELS: Record<PeopleFilter, string> = {
  all: 'All',
  ...BUCKET_LABELS,
};

/** Filter tab order: "All" first, then the same 4 buckets in spec order. */
export const FILTER_ORDER: PeopleFilter[] = ['all', ...BUCKET_ORDER];

/** List rows only expose `team_name` (sentinel-bearing), not `team_id`. */
export function hasTeam(user: UserListItem): boolean {
  return normalizeSentinel(user.team_name) !== null;
}

/**
 * Team status is checked before role: a teamless user always lands in
 * "no_team" regardless of role (which in practice absorbs virtually every
 * admin, since admins never carry a team_id) — confirmed with the user.
 * An incomplete account (no employment_detail, so `role` is the "No
 * record!" sentinel) also has no team, so it lands here too — falling
 * back to "no_team" even in the (currently unreachable) case a user has a
 * team but an unparseable role.
 */
export function getBucket(user: UserListItem): PeopleBucket {
  if (!hasTeam(user)) return 'no_team';
  return normalizeRole(user.role) ?? 'no_team';
}

function byUsername(a: UserListItem, b: UserListItem): number {
  return a.username.localeCompare(b.username);
}

/** Rows for a single filter tab; 'all' returns everyone, alphabetized. */
export function filterUsers(users: UserListItem[], filter: PeopleFilter): UserListItem[] {
  const rows = filter === 'all' ? users : users.filter((user) => getBucket(user) === filter);
  return [...rows].sort(byUsername);
}

export interface PeopleGroup {
  bucket: PeopleBucket;
  label: string;
  users: UserListItem[];
}

/** Default "All" view: the 4 buckets in spec order, each alphabetized; empty buckets omitted. */
export function groupUsers(users: UserListItem[]): PeopleGroup[] {
  return BUCKET_ORDER.map((bucket) => ({
    bucket,
    label: BUCKET_LABELS[bucket],
    users: users.filter((user) => getBucket(user) === bucket).sort(byUsername),
  })).filter((group) => group.users.length > 0);
}
