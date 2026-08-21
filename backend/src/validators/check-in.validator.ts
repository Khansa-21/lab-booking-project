import { z } from 'zod';

export const checkInSchema = z.object({ code: z.string().trim().length(12).regex(/^[A-Z0-9]+$/) }).strict();
export type CheckInInput = z.infer<typeof checkInSchema>;
