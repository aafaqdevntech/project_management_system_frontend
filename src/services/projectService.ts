import { axiosClient } from '@/api/axiosClient';
import type { Project, ProjectStatus } from '@/types/projects';
import type { CreateProjectFormValues } from '@/schemas/project.schema';

export async function getProjects(): Promise<Project[]> {
  const { data } = await axiosClient.get<Project[]>('projects');
  return data;
}

export async function getProject(id: number): Promise<Project> {
  const { data } = await axiosClient.get<Project>(`projects/${id}`);
  return data;
}

export async function createProject(body: CreateProjectFormValues): Promise<Project> {
  const { data } = await axiosClient.post<Project>('projects', body);
  return data;
}

interface UpdateProjectBody {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  end_date?: string;
}

export async function updateProject(id: number, body: UpdateProjectBody): Promise<Project> {
  const { data } = await axiosClient.patch<Project>(`projects/${id}`, body);
  return data;
}

export async function assignTeamToProject(id: number, teamName: string): Promise<Project> {
  const { data } = await axiosClient.post<Project>(`projects/${id}/assign_team`, {
    team_name: teamName,
  });
  return data;
}

export async function unassignTeamFromProject(id: number): Promise<Project> {
  const { data } = await axiosClient.delete<Project>(`projects/${id}/unassign_team`);
  return data;
}
