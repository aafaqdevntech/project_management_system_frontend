import { Link } from 'react-router-dom';
import { formatDateSafe } from '@/lib/formatDate';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_BADGE_VARIANT } from '@/lib/projectStatus';
import { TASK_PRIORITY_BADGE_VARIANT } from '@/lib/taskPriority';
import { TASK_STATUS_LABELS, TASK_STATUS_BADGE_VARIANT } from '@/lib/taskStatus';
import type { Project } from '@/types/projects';
import type { Task } from '@/types/tasks';
import type { Issue } from '@/types/issues';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { type Column } from '@/components/ui/Table';

/** Shared across the AdminOverview and TeamLeadOverview dashboard widgets. */
export const projectColumns: Column<Project>[] = [
  { key: 'title', header: 'Title', render: (row) => row.title },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={PROJECT_STATUS_BADGE_VARIANT[row.status]}>{PROJECT_STATUS_LABELS[row.status]}</Badge>
    ),
  },
  { key: 'end_date', header: 'Deadline', render: (row) => formatDateSafe(row.end_date, 'MMM d, yyyy') },
  { key: 'team_id', header: 'Team', render: (row) => row.team_id ?? '—' },
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

export const taskColumns: Column<Task>[] = [
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

export const issueColumns: Column<Issue>[] = [
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
