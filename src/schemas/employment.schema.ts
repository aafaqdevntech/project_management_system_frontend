import { z } from 'zod';

/**
 * POST /users/{id}/employment_detail body. `joined_at` comes from a
 * datetime-local input (e.g. "2026-08-07T09:00") and is converted to an
 * ISO string before being sent — see AddEmploymentModal.
 */
export const employmentSchema = z.object({
  job_position: z.string().min(1, 'Job position is required'),
  role: z.enum(['admin', 'team_lead', 'member'], {
    message: 'Role is required',
  }),
  joined_at: z.string().min(1, 'Join date is required'),
});

export type EmploymentFormValues = z.infer<typeof employmentSchema>;
