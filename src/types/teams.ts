/** Shape returned by GET /teams (list) and GET /teams/{id} (single). */
export interface Team {
  id: number;
  name: string;
  team_lead_id: number | null;
  team_lead_name: string | null;
  description: string;
  created_at: string;
}
