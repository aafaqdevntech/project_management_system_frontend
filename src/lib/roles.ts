import type { UserRole } from '@/types/auth';

/** Human-readable labels for each role, used in badges and menus. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  team_lead: 'Team Lead',
  member: 'Member',
};

/**
 * Badge color per role, for lists showing many users at once (e.g. the
 * People directory) where distinguishing roles at a glance is useful.
 * Single-user badges (Topbar, ProfileModal) intentionally stay a plain
 * "primary" badge instead — there's nothing to visually distinguish there.
 */
export const ROLE_BADGE_VARIANT: Record<UserRole, 'primary' | 'info' | 'neutral'> = {
  admin: 'primary',
  team_lead: 'info',
  member: 'neutral',
};
