export type ProjectStatus = 'planning' | 'active' | 'onhold' | 'completed' | 'archived';

/** Shape returned by GET /projects (list) and GET /projects/{id} (single). */
export interface Project {
  id: number;
  team_id: number | null;
  created_by_id: number;
  title: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
