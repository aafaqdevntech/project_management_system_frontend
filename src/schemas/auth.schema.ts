import { z } from 'zod';

/**
 * `login` accepts either a username or an email on the backend, so we only
 * enforce "required" here rather than an email format.
 */
export const loginSchema = z.object({
  login: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
