import { z } from 'zod';

const email = z.string().trim().email().max(255).transform((value) => value.toLowerCase());
const password = z
  .string()
  .min(8)
  .max(30)
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character.');

export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email,
    password,
  })
  .strict();

export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().length(64),
    password,
  })
  .strict();

export const loginSchema = z
  .object({
    email,
    password: z.string().min(1).max(30),
  })
  .strict();
