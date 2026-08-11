import type { UserRole } from '@/types/auth';

type ActionVariant = 'secondary' | 'danger';

export interface PeopleAction {
  key: string;
  label: string;
  variant: ActionVariant;
  /** False for the one action that's wired to a real endpoint (currently
   * just "Add profile" on a target with no profile yet) — rendered as a
   * clickable button instead of the inert placeholder. */
  disabled: boolean;
}

/** Shown as a tooltip on every disabled action button below — most aren't wired to an endpoint yet. */
export const PLACEHOLDER_ACTION_TITLE = 'Not available yet';

/**
 * Which management actions render for the logged-in user's role while
 * viewing another user's detail page. Gated on the viewer's role, not the
 * viewed user's. `targetHasTeam` flips the team action's label between
 * assign/unassign, `targetHasProfile` flips the profile action between
 * "Add profile" (enabled, POST /users/{id}/profile) and "Update profile"
 * (still a placeholder), and `targetHasEmployment` collapses the
 * team/role/job_position trio into a single enabled "Add employment"
 * (POST /users/{id}/employment_detail) until the record exists.
 */
export function getDetailActionsForRole(
  viewerRole: UserRole,
  targetHasTeam: boolean,
  targetHasProfile: boolean,
  targetHasEmployment: boolean,
): PeopleAction[] {
  switch (viewerRole) {
    case 'admin': {
      const employmentActions: PeopleAction[] = targetHasEmployment
        ? [
            {
              key: 'team',
              label: targetHasTeam ? 'Unassign team' : 'Assign team',
              variant: 'secondary',
              disabled: true,
            },
            { key: 'role', label: 'Change role', variant: 'secondary', disabled: true },
            {
              key: 'job_position',
              label: 'Change job position',
              variant: 'secondary',
              disabled: true,
            },
          ]
        : [{ key: 'employment', label: 'Add employment', variant: 'secondary', disabled: false }];

      return [
        { key: 'edit', label: 'Edit', variant: 'secondary', disabled: true },
        ...employmentActions,
        {
          key: 'profile',
          label: targetHasProfile ? 'Update profile' : 'Add profile',
          variant: 'secondary',
          disabled: targetHasProfile,
        },
        { key: 'delete', label: 'Delete user', variant: 'danger', disabled: true },
      ];
    }
    case 'team_lead':
      return [{ key: 'assign_task', label: 'Assign task', variant: 'secondary', disabled: true }];
    case 'member':
      return [];
  }
}
