import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { getAllTasks } from '@/services/taskService';
import { isForbiddenError } from '@/lib/apiError';
import { formatDateSafe } from '@/lib/formatDate';
import { TASK_PRIORITY_BADGE_VARIANT } from '@/lib/taskPriority';
import { TASK_STATUS_LABELS, TASK_STATUS_BADGE_VARIANT, TASK_STATUS_OPTIONS } from '@/lib/taskStatus';
import type { Task, TaskStatus } from '@/types/tasks';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, type Column } from '@/components/ui/Table';

type AssigneeFilter = 'all' | 'mine';
type StatusFilter = TaskStatus | 'all';

const columns: Column<Task>[] = [
  { key: 'title', header: 'Title', render: (row) => row.title },
  {
    key: 'priority',
    header: 'Priority',
    render: (row) => <Badge variant={TASK_PRIORITY_BADGE_VARIANT[row.priority]}>{row.priority}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={TASK_STATUS_BADGE_VARIANT[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  { key: 'due_date', header: 'Due date', render: (row) => formatDateSafe(row.due_date, 'MMM d, yyyy') },
  {
    key: 'assigned_to',
    header: 'Assigned to',
    render: (row) => row.assigned_to_name ?? 'Unassigned',
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (row) => (
      <Link to={`/projects/${row.project_id}/tasks/${row.id}`}>
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

export function TasksListPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((key) => key + 1);

  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setIsForbidden(false);

    getAllTasks()
      .then((data) => {
        if (!cancelled) setTasks(data);
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

  // Both filters are applied client-side against the already-fetched list — no re-fetch.
  const filteredTasks = (tasks ?? []).filter((task) => {
    if (assigneeFilter === 'mine' && task.assigned_to_id !== currentUser?.id) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Tasks</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={assigneeFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setAssigneeFilter('all')}
        >
          All
        </Button>
        <Button
          variant={assigneeFilter === 'mine' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setAssigneeFilter('mine')}
        >
          My tasks
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant={statusFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All statuses
        </Button>
        {TASK_STATUS_OPTIONS.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {TASK_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <TableSkeleton />
        ) : isForbidden ? (
          <div className="rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            You're not assigned to a team yet, so there are no tasks to show.
          </div>
        ) : isError ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3 text-sm text-slate-600">
            <span>Couldn't load tasks.</span>
            <Button variant="secondary" size="sm" onClick={reload}>
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredTasks}
            rowKey={(row) => row.id}
            emptyMessage="No tasks match these filters."
          />
        )}
      </div>
    </div>
  );
}
