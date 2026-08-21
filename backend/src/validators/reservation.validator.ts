import { z } from 'zod';

export const createReservationSchema = z.object({
  equipmentId: z.number().int().positive(),
  startDateTime: z.coerce.date(),
  endDateTime: z.coerce.date(),
  purpose: z.string().trim().min(5).max(500),
});

export const reservationIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
