import type { ProjectStatus } from '@/types/projects';

/** Human-readable labels for each project status, used in badges and the status select. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  onhold: 'On hold',
  completed: 'Completed',
  archived: 'Archived',
};

export const PROJECT_STATUS_BADGE_VARIANT: Record<
  ProjectStatus,
  'neutral' | 'primary' | 'success' | 'warning'
> = {
  planning: 'neutral',
  active: 'success',
  onhold: 'warning',
  completed: 'primary',
  archived: 'neutral',
};

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  'planning',
  'active',
  'onhold',
  'completed',
  'archived',
];
