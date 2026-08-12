import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or fewer'),
  description: z.string().max(5000, 'Description must be 5000 characters or fewer').optional(),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const editProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or fewer'),
  description: z.string().max(5000, 'Description must be 5000 characters or fewer').optional(),
  end_date: z.string().optional(),
});

export type EditProjectFormValues = z.infer<typeof editProjectSchema>;

export const changeStatusSchema = z.object({
  status: z.enum(['planning', 'active', 'onhold', 'completed', 'archived'], {
    message: 'Status is required',
  }),
});

export type ChangeStatusFormValues = z.infer<typeof changeStatusSchema>;

export const assignTeamSchema = z.object({
  team_name: z.string().min(1, 'Team name is required'),
});

export type AssignTeamFormValues = z.infer<typeof assignTeamSchema>;
