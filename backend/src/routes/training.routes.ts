import { Router } from 'express';

import {
  completeTrainingController,
  myTrainingController,
  searchTrainingUsersController,
  trainingManagementController,
} from '../controllers/training.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { completeTrainingSchema, trainingUserSearchSchema } from '../validators/training.validator.js';

export const trainingRouter = Router();

trainingRouter.use(authenticate);
trainingRouter.get('/mine', myTrainingController);
trainingRouter.get('/management', authorize('TEACHER', 'ADMIN'), trainingManagementController);
trainingRouter.get('/users', authorize('TEACHER', 'ADMIN'), validateQuery(trainingUserSearchSchema), searchTrainingUsersController);
trainingRouter.post(
  '/records',
  authorize('TEACHER', 'ADMIN'),
  validateBody(completeTrainingSchema),
  completeTrainingController,
);
