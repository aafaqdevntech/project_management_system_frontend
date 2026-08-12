import { axiosClient } from '@/api/axiosClient';
import type { Issue } from '@/types/issues';
import type { CreateIssueFormValues } from '@/schemas/issue.schema';

export async function getProjectIssues(projectId: number): Promise<Issue[]> {
  const { data } = await axiosClient.get<Issue[]>(`projects/${projectId}/issues`);
  return data;
}

/** Every issue visible to the current user, across all projects. */
export async function getAllIssues(): Promise<Issue[]> {
  const { data } = await axiosClient.get<Issue[]>('issues');
  return data;
}

export async function createProjectIssue(
  projectId: number,
  body: CreateIssueFormValues,
): Promise<Issue> {
  const { data } = await axiosClient.post<Issue>(`projects/${projectId}/issues`, body);
  return data;
}

export async function getIssue(id: number): Promise<Issue> {
  const { data } = await axiosClient.get<Issue>(`issues/${id}`);
  return data;
}

export async function resolveIssue(id: number, resolutionNote: string): Promise<Issue> {
  const { data } = await axiosClient.post<Issue>(`issues/${id}/resolve`, {
    resolution_note: resolutionNote,
  });
  return data;
}

export async function rejectIssue(id: number, resolutionNote: string): Promise<Issue> {
  const { data } = await axiosClient.post<Issue>(`issues/${id}/reject`, {
    resolution_note: resolutionNote,
  });
  return data;
}
