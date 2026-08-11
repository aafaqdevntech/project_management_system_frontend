import { z } from 'zod';

/**
 * POST /users/{id}/profile body. Only `full_name` is required by the UI;
 * the rest are optional text fields the backend stores as-is (empty string
 * submitted as `null` so the profile view renders "—" instead of blank).
 */
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  image_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
