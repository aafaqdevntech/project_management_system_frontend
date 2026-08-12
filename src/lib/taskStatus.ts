import type { TaskStatus } from '@/types/tasks';

/** Human-readable labels for each task status, used in badges and the status filter. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  working: 'Working',
  on_hold: 'On hold',
  ready_for_review: 'Ready for review',
  returned: 'Returned',
  completed: 'Completed',
};

export const TASK_STATUS_BADGE_VARIANT: Record<
  TaskStatus,
  'neutral' | 'primary' | 'success' | 'warning' | 'info'
> = {
  unassigned: 'neutral',
  assigned: 'info',
  working: 'primary',
  on_hold: 'warning',
  ready_for_review: 'info',
  returned: 'warning',
  completed: 'success',
};

export const TASK_STATUS_OPTIONS: TaskStatus[] = [
  'unassigned',
  'assigned',
  'working',
  'on_hold',
  'ready_for_review',
  'returned',
  'completed',
];
