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
