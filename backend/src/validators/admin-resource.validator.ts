import { z } from 'zod';

import { BOOKING_AUDIENCES, EQUIPMENT_STATUSES } from '../models/model-values.js';

const optionalDescription = z.string().trim().max(1000).nullable().optional();

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optionalDescription,
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: optionalDescription,
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');

const equipmentFields = {
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(2).max(150),
  description: optionalDescription,
  location: z.string().trim().min(2).max(150),
  imageUrl: z.string().url().max(500).nullable().optional(),
  status: z.enum(EQUIPMENT_STATUSES),
  bookingAudience: z.enum(BOOKING_AUDIENCES),
  requiresApproval: z.boolean(),
  requiresTraining: z.boolean(),
  maxBookingHours: z.number().positive().max(24),
};

export const createEquipmentSchema = z.object(equipmentFields);
export const updateEquipmentSchema = createEquipmentSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.');

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
