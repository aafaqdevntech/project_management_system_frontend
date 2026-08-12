import type { TaskPriority } from '@/types/tasks';

/** Badge color per task priority, used everywhere a task's priority is shown. */
export const TASK_PRIORITY_BADGE_VARIANT: Record<TaskPriority, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  normal: 'neutral',
};
