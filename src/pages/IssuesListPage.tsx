import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllIssues } from '@/services/issueService';
import { isForbiddenError } from '@/lib/apiError';
import { formatDateSafe } from '@/lib/formatDate';
import type { Issue } from '@/types/issues';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

const columns: Column<Issue>[] = [
  { key: 'title', header: 'Title', render: (row) => row.title },
  { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
  { key: 'raised_by', header: 'Raised by', render: (row) => row.raised_by_name },
  { key: 'created_at', header: 'Created', render: (row) => formatDateSafe(row.created_at, 'MMM d, yyyy') },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/projects/${row.project_id}/issues/${row.id}`}>
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

export function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>();
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

    getAllIssues()
      .then((data) => {
        if (!cancelled) setIssues(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isForbiddenError(err)) setIsForbidden(true);
        else setIsError(true);
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
      <h1 className="text-xl font-semibold text-slate-900">Issues</h1>

      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton />
        ) : isForbidden ? (
          <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            You're not assigned to a team yet, so there are no issues to show.
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load issues.</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={issues ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No issues yet."
          />
        )}
      </div>
    </div>
  );
}
