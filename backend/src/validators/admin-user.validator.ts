import { z } from 'zod';

export const createTeacherSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8)
      .max(30)
      .regex(/[a-z]/, 'Password must contain a lowercase letter.')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
      .regex(/[0-9]/, 'Password must contain a number.')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.'),
  })
  .strict();

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
