export type TaskPriority = 'critical' | 'high' | 'medium' | 'normal';

export type TaskStatus =
  | 'unassigned'
  | 'assigned'
  | 'working'
  | 'on_hold'
  | 'ready_for_review'
  | 'returned'
  | 'completed';

/** Shape returned by GET /projects/{project_id}/tasks. */
export interface Task {
  id: number;
  project_id: number;
  issue_id: number | null;
  created_by_id: number;
  assigned_to_id: number | null;
  assigned_to_name: string | null;
  created_by_name: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
