export type TaskPriority = 'critical' | 'high' | 'medium' | 'normal';

/** Shape returned by GET /projects/{project_id}/tasks. */
export interface Task {
  id: number;
  project_id: number;
  issue_id: number | null;
  created_by_id: number;
  assigned_to_id: number | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
