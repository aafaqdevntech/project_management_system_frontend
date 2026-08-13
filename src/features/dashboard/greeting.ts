import type { AuthUser } from '@/types/auth';
import { ROLE_LABELS } from '@/lib/roles';

export function getFirstName(user: AuthUser): string {
  const firstName = user.profile?.full_name.trim().split(/\s+/)[0];
  return firstName || user.username;
}

/** "You're an Admin" for admins (they aren't attached to a team); role + team status otherwise. */
export function getDashboardSubtitle(user: AuthUser): string {
  if (!user.employment_detail) return 'Account setup incomplete';
  const { role, team_id } = user.employment_detail;
  if (role === 'admin') return "You're an Admin";
  return `${ROLE_LABELS[role]} • ${team_id ? `Team #${team_id}` : 'No team'}`;
}

/**
 * Describes the role-specific section planned below the stat tiles. Returns
 * null when nothing should render yet (member with no team, or an account
 * with no employment_detail at all, has nothing to show there) — also null
 * for admin/team_lead now that AdminOverview/TeamLeadOverview render the
 * real content there.
 */
export function getBelowSectionNote(user: AuthUser): string | null {
  if (!user.employment_detail) return null;

  switch (user.employment_detail.role) {
    case 'admin':
      return null;
    case 'team_lead':
      return null;
    case 'member':
      return user.employment_detail.team_id ? 'Tasks and issues will appear here.' : null;
  }
}
