import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getProjects } from '@/services/projectService';
import { getTeams } from '@/services/teamService';
import { AddProjectModal } from '@/features/projects/AddProjectModal';
import type { Project } from '@/types/projects';
import type { Team } from '@/types/teams';
import { isForbiddenError } from '@/lib/apiError';
import { formatDateSafe } from '@/lib/formatDate';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_BADGE_VARIANT } from '@/lib/projectStatus';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-white p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  );
}

export function ProjectsListPage() {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const viewerRole = useAppSelector((state) => state.auth.user?.employment_detail?.role);

  const [projects, setProjects] = useState<Project[]>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setIsForbidden(false);

    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isForbiddenError(err)) {
          setIsForbidden(true);
        } else {
          setIsError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Team names are a display nicety — if this fails (e.g. the caller isn't
    // an admin), team_id just falls back to showing as a raw number below,
    // it must never hide the projects list itself.
    getTeams()
      .then((data) => {
        if (!cancelled) setTeams(data);
      })
      .catch(() => {
        // ignore — teamNameById just stays empty, columns fall back to raw team_id
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const teamNameById = new Map(teams.map((team) => [team.id, team.name]));

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <Link to={`/projects/${row.id}`} className="font-medium text-slate-900 hover:underline">
          {row.title}
        </Link>
      ),
    },
    {
      key: 'team',
      header: 'Team',
      render: (row) =>
        row.team_id !== null ? (teamNameById.get(row.team_id) ?? `Team #${row.team_id}`) : '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={PROJECT_STATUS_BADGE_VARIANT[row.status]}>
          {PROJECT_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: 'start_date',
      header: 'Start date',
      render: (row) => formatDateSafe(row.start_date, 'MMM d, yyyy'),
    },
    {
      key: 'end_date',
      header: 'End date',
      render: (row) => formatDateSafe(row.end_date, 'MMM d, yyyy'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Link to={`/projects/${row.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Projects</h1>
        {viewerRole === 'admin' ? (
          <Button size="sm" onClick={() => setIsAddProjectOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add project
          </Button>
        ) : null}
      </div>

      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onSuccess={reload}
      />

      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton />
        ) : isForbidden ? (
          <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            You're not assigned to a team yet, so there are no projects to show.
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load projects.</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={projects ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No projects yet."
          />
        )}
      </div>
    </div>
  );
}
