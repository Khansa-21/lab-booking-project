import { z } from 'zod';

export const reviewReservationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
});

export type ReviewReservationInput = z.infer<typeof reviewReservationSchema>;
