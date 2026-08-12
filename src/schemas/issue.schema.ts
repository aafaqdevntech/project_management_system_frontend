import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CreateIssueFormValues = z.infer<typeof createIssueSchema>;
