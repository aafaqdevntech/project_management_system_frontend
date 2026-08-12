import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { getTeams } from '@/services/teamService';
import { AddTeamModal } from '@/features/teams/AddTeamModal';
import type { Team } from '@/types/teams';
import { formatDateSafe } from '@/lib/formatDate';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

const columns: Column<Team>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
  },
  {
    key: 'team_lead_id',
    header: 'Team lead ID',
    render: (row) => row.team_lead_id ?? '—',
  },
  {
    key: 'team_lead_name',
    header: 'Team lead',
    render: (row) => row.team_lead_name ?? '—',
  },
  {
    key: 'description',
    header: 'Description',
    render: (row) => row.description,
  },
  {
    key: 'created_at',
    header: 'Created',
    render: (row) => formatDateSafe(row.created_at, 'MMM d, yyyy'),
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

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-white p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  );
}

export function TeamsListPage() {
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const viewerRole = useAppSelector((state) => state.auth.user?.employment_detail?.role);

  const [data, setData] = useState<Team[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    getTeams()
      .then((teams) => {
        if (!cancelled) setData(teams);
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Teams</h1>
        {viewerRole === 'admin' ? (
          <Button size="sm" onClick={() => setIsAddTeamOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add team
          </Button>
        ) : null}
      </div>

      <AddTeamModal
        isOpen={isAddTeamOpen}
        onClose={() => setIsAddTeamOpen(false)}
        onSuccess={reload}
      />

      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load teams.</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={data ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No teams yet."
          />
        )}
      </div>
    </div>
  );
}
