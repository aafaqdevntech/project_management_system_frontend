import {
  Building2,
  FolderKanban,
  CheckSquare,
  AlertCircle,
  Users,
  ListChecks,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types/auth';
import type { MyCountsResponse } from '@/types/dashboard';

interface StatTileConfig {
  /** Key into the role-specific `counts` object returned by GET me/count. */
  key: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Which stat tiles appear for each role, in display order. Keys must match
 * the `counts` field names in the matching branch of `MyCountsResponse`
 * (src/types/dashboard.ts) — kept as plain strings and looked up dynamically
 * in DashboardPage so tile *labels/icons* can render immediately from the
 * already-known role, before the counts themselves have loaded.
 */
const STAT_TILES_BY_ROLE: Record<UserRole, StatTileConfig[]> = {
  admin: [
    { key: 'teams', label: 'Teams', icon: Building2 },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'issues', label: 'Issues', icon: AlertCircle },
  ],
  team_lead: [
    { key: 'teams_members', label: 'Team mates', icon: Users },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'issues', label: 'Issues', icon: AlertCircle },
  ],
  member: [
    { key: 'teams_members', label: 'Team mates', icon: Users },
    { key: 'projects', label: 'Projects', icon: FolderKanban },
    { key: 'my_tasks', label: 'My tasks', icon: ListChecks },
    { key: 'issues', label: 'Issues', icon: AlertCircle },
    { key: 'due_today_tasks', label: 'Due today', icon: CalendarClock },
  ],
};

export function getStatTilesForRole(role: UserRole): StatTileConfig[] {
  return STAT_TILES_BY_ROLE[role];
}

/** Reads a tile's numeric value out of the loaded counts response, if any. */
export function getStatTileValue(
  data: MyCountsResponse | undefined,
  key: string,
): number | undefined {
  if (!data) return undefined;
  return (data.counts as Record<string, number>)[key];
}
