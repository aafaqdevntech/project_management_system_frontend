/** Shape returned by GET /projects/{project_id}/issues. */
export interface Issue {
  id: number;
  project_id: number;
  raised_by_id: number;
  raised_by_name: string;
  title: string;
  description: string | null;
  status: string;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}
