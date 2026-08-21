import { z } from 'zod';

import { EQUIPMENT_STATUSES } from '../models/model-values.js';

export const equipmentQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  status: z.enum(EQUIPMENT_STATUSES).optional(),
});

export const equipmentIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const availabilityQuerySchema = z
  .object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  })
  .refine(({ start, end }) => end > start, {
    message: 'End time must be after start time.',
    path: ['end'],
  })
  .refine(({ start, end }) => end.getTime() - start.getTime() <= 24 * 60 * 60 * 1000, {
    message: 'Availability range cannot exceed one day.',
    path: ['end'],
  });

export type EquipmentQuery = z.infer<typeof equipmentQuerySchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
