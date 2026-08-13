import { axiosClient } from '@/api/axiosClient';
import type { Task, TaskPriority } from '@/types/tasks';
import type { Teammate } from '@/types/teammates';
import type { ChangeTaskStatusFormValues } from '@/schemas/task.schema';

export async function getProjectTasks(projectId: number): Promise<Task[]> {
  const { data } = await axiosClient.get<Task[]>(`projects/${projectId}/tasks`);
  return data;
}

/** Every task visible to the current user, across all projects. */
export async function getAllTasks(): Promise<Task[]> {
  const { data } = await axiosClient.get<Task[]>('tasks');
  return data;
}

interface CreateTaskBody {
  title: string;
  description: string;
  priority?: TaskPriority;
  due_date?: string;
  issue_id?: number | null;
}

export async function createProjectTask(projectId: number, body: CreateTaskBody): Promise<Task> {
  const { data } = await axiosClient.post<Task>(`projects/${projectId}/tasks`, body);
  return data;
}

export async function assignTask(taskId: number, assignedToId: number): Promise<Task> {
  const { data } = await axiosClient.post<Task>(`tasks/${taskId}/assign`, {
    assigned_to_id: assignedToId,
    status: 'assigned',
  });
  return data;
}

/** Everyone on the current user's team, excluding themself — used to populate the assign-task dropdown. */
export async function getTeammates(): Promise<Teammate[]> {
  const { data } = await axiosClient.get<Teammate[]>('me/teammates');
  return data;
}

export async function changeTaskStatus(
  taskId: number,
  status: ChangeTaskStatusFormValues['status'],
): Promise<Task> {
  const { data } = await axiosClient.patch<Task>(`tasks/${taskId}/status`, { status });
  return data;
}