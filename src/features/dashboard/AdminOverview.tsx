import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProjects } from '@/services/projectService';
import { getTeams } from '@/services/teamService';
import { getUsers } from '@/services/peopleService';
import { hasTeam, normalizeRole } from '@/features/people/peopleGrouping';
import { normalizeSentinel } from '@/lib/sentinel';
import { ROLE_LABELS, ROLE_BADGE_VARIANT } from '@/lib/roles';
import { DashboardSection } from '@/features/dashboard/DashboardSection';
import { projectColumns } from '@/features/dashboard/dashboardColumns';
import type { Project } from '@/types/projects';
import type { Team } from '@/types/teams';
import type { UserListItem } from '@/types/users';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { type Column } from '@/components/ui/Table';

const ROW_LIMIT = 7;
const TEAM_DESCRIPTION_MAX_LENGTH = 100;

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

const teamColumns: Column<Team>[] = [
  { key: 'id', header: 'ID', render: (row) => row.id },
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'team_lead_name', header: 'Team lead', render: (row) => row.team_lead_name ?? '—' },
  {
    key: 'description',
    header: 'Description',
    render: (row) => truncate(row.description, TEAM_DESCRIPTION_MAX_LENGTH),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/teams/${row.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
    className: 'text-right',
  },
];

const userColumns: Column<UserListItem>[] = [
  {
    key: 'user',
    header: 'User',
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar src={normalizeSentinel(row.image_url)} name={row.username} size="sm" />
        <span className="font-medium text-slate-900">{row.username}</span>
      </div>
    ),
  },
  { key: 'email', header: 'Email', render: (row) => row.email },
  {
    key: 'role',
    header: 'Role',
    render: (row) => {
      const role = normalizeRole(row.role);
      return role ? (
        <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
      ) : (
        <Badge variant="neutral">Not set</Badge>
      );
    },
  },
  {
    key: 'job_position',
    header: 'Job position',
    render: (row) => normalizeSentinel(row.job_position) ?? '—',
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/people/${row.id}`}>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </Link>
    ),
    className: 'text-right',
  },
];

/** Admin-only dashboard preview: active projects, teams, and users without a team — all client-side filtered/sorted/capped, since none of these endpoints support that server-side. */
export function AdminOverview() {
  const [projects, setProjects] = useState<Project[]>();
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isProjectsError, setIsProjectsError] = useState(false);
  const [projectsReloadKey, setProjectsReloadKey] = useState(0);

  const [teams, setTeams] = useState<Team[]>();
  const [isTeamsLoading, setIsTeamsLoading] = useState(true);
  const [isTeamsError, setIsTeamsError] = useState(false);
  const [teamsReloadKey, setTeamsReloadKey] = useState(0);

  const [users, setUsers] = useState<UserListItem[]>();
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isUsersError, setIsUsersError] = useState(false);
  const [usersReloadKey, setUsersReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsProjectsLoading(true);
    setIsProjectsError(false);

    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {
        if (!cancelled) setIsProjectsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsProjectsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectsReloadKey]);

  useEffect(() => {
    let cancelled = false;
    setIsTeamsLoading(true);
    setIsTeamsError(false);

    getTeams()
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch(() => {
        if (!cancelled) setIsTeamsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsTeamsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [teamsReloadKey]);

  useEffect(() => {
    let cancelled = false;
    setIsUsersLoading(true);
    setIsUsersError(false);

    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch(() => {
        if (!cancelled) setIsUsersError(true);
      })
      .finally(() => {
        if (!cancelled) setIsUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [usersReloadKey]);

  // Active projects, soonest deadline first — undated projects sort last.
  // ISO date strings compare correctly as plain strings, no Date needed.
  const activeProjects = (projects ?? [])
    .filter((project) => project.status === 'active')
    .sort((a, b) => {
      if (!a.end_date) return 1;
      if (!b.end_date) return -1;
      return a.end_date.localeCompare(b.end_date);
    })
    .slice(0, ROW_LIMIT);

  const teamsPreview = (teams ?? []).slice(0, ROW_LIMIT);

  // Users without a team, most recently joined first — missing dates sort last.
  const usersWithoutTeam = (users ?? [])
    .filter((user) => !hasTeam(user))
    .sort((a, b) => {
      const joinedA = normalizeSentinel(a.joined_at);
      const joinedB = normalizeSentinel(b.joined_at);
      if (!joinedA) return 1;
      if (!joinedB) return -1;
      return joinedB.localeCompare(joinedA);
    })
    .slice(0, ROW_LIMIT);

  return (
    <div className="mt-6 space-y-6">
      <DashboardSection
        title="Active projects"
        isLoading={isProjectsLoading}
        isError={isProjectsError}
        onRetry={() => setProjectsReloadKey((key) => key + 1)}
        columns={projectColumns}
        data={activeProjects}
        rowKey={(row) => row.id}
        emptyMessage="No active projects."
      />
      <DashboardSection
        title="Teams"
        isLoading={isTeamsLoading}
        isError={isTeamsError}
        onRetry={() => setTeamsReloadKey((key) => key + 1)}
        columns={teamColumns}
        data={teamsPreview}
        rowKey={(row) => row.id}
        emptyMessage="No teams yet."
      />
      <DashboardSection
        title="Users without a team"
        isLoading={isUsersLoading}
        isError={isUsersError}
        onRetry={() => setUsersReloadKey((key) => key + 1)}
        columns={userColumns}
        data={usersWithoutTeam}
        rowKey={(row) => row.id}
        emptyMessage="Everyone is on a team."
      />
    </div>
  );
}
