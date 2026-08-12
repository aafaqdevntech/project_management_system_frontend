import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export type CreateIssueFormValues = z.infer<typeof createIssueSchema>;

/** "open" is excluded — resolving/rejecting are the only status changes the UI exposes. */
export const changeIssueStatusSchema = z.object({
  status: z.enum(['resolved', 'rejected'], { message: 'Status is required' }),
  resolution_note: z.string().min(1, 'Resolution note is required'),
});

export type ChangeIssueStatusFormValues = z.infer<typeof changeIssueStatusSchema>;
