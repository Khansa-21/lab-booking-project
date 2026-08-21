import { z } from 'zod';

export const completeTrainingSchema = z
  .object({
    userId: z.number().int().positive(),
    equipmentId: z.number().int().positive(),
  })
  .strict();

export type CompleteTrainingInput = z.infer<typeof completeTrainingSchema>;

export const trainingUserSearchSchema = z.object({
  search: z.string().trim().min(2).max(100),
});
export type TrainingUserSearch = z.infer<typeof trainingUserSearchSchema>;
