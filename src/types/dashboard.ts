/** Response shape of GET me/count — varies by the caller's role. */
export interface AdminCounts {
  role: 'admin';
  counts: {
    teams: number;
    projects: number;
    tasks: number;
    issues: number;
  };
}

export interface TeamLeadCounts {
  role: 'team_lead';
  counts: {
    teams_members: number;
    projects: number;
    tasks: number;
    issues: number;
  };
}

export interface MemberCounts {
  role: 'member';
  counts: {
    teams_members: number;
    projects: number;
    my_tasks: number;
    issues: number;
    due_today_tasks: number;
  };
}

export type MyCountsResponse = AdminCounts | TeamLeadCounts | MemberCounts;
