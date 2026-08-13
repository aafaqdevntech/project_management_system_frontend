import { z } from 'zod';

/**
 * `priority` defaults server-side when omitted, so it's left optional here
 * too. `issue_id` comes from a <Select> of the project's existing issues —
 * "" means none, converted to `null` before the request (see AddTaskModal).
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['critical', 'high', 'medium', 'normal']).optional(),
  due_date: z.string().optional(),
  issue_id: z.string().optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const assignTaskSchema = z.object({
  assigned_to_id: z.string().min(1, 'Please select a teammate'),
});

export type AssignTaskFormValues = z.infer<typeof assignTaskSchema>;

export const changeTaskStatusSchema = z.object({
  status: z.enum(['on_hold', 'returned', 'completed', 'working', 'ready_for_review'], {
    message: 'Status is required',
  }),
});

export type ChangeTaskStatusFormValues = z.infer<typeof changeTaskStatusSchema>;
