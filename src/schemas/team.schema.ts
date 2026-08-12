import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;

/** Shared by the assign-lead / assign-member / unassign-member forms — each only needs a username. */
export const assignUsernameSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export type AssignUsernameFormValues = z.infer<typeof assignUsernameSchema>;
