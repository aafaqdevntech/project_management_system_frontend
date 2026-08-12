import { axiosClient } from '@/api/axiosClient';
import type { Team } from '@/types/teams';
import type { CreateTeamFormValues } from '@/schemas/team.schema';
import type { EmploymentDetail } from '@/types/auth';

export async function getTeams(): Promise<Team[]> {
  const { data } = await axiosClient.get<Team[]>('teams');
  return data;
}

export async function getTeam(id: number): Promise<Team> {
  const { data } = await axiosClient.get<Team>(`teams/${id}`);
  return data;
}

export async function createTeam(body: CreateTeamFormValues): Promise<Team> {
  // Assigning a lead happens later via assignLead (which takes a username) —
  // team_lead_name isn't a form field, just a constant the backend expects on create.
  const { data } = await axiosClient.post<Team>('teams', { ...body, team_lead_name: '' });
  return data;
}

export async function assignLead(teamId: number, username: string): Promise<Team> {
  const { data } = await axiosClient.patch<Team>('teams/assign_lead', { team_id: teamId, username });
  return data;
}

export async function unassignLead(teamId: number): Promise<Team> {
  const { data } = await axiosClient.patch<Team>('teams/assign_lead', { team_id: teamId });
  return data;
}

export async function assignMember(teamId: number, username: string): Promise<EmploymentDetail> {
  const { data } = await axiosClient.patch<EmploymentDetail>('teams/assign_member', {
    team_id: teamId,
    username,
  });
  return data;
}

export async function unassignMember(teamId: number, username: string): Promise<EmploymentDetail> {
  const { data } = await axiosClient.patch<EmploymentDetail>('teams/unassign_member', {
    team_id: teamId,
    username,
  });
  return data;
}
