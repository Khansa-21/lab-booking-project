import { Router } from 'express';

import {
  equipmentDetailController,
  equipmentAvailabilityController,
  bookingAlternativesController,
  listEquipmentController,
} from '../controllers/equipment.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import {
  equipmentIdSchema,
  availabilityQuerySchema,
  equipmentQuerySchema,
} from '../validators/equipment.validator.js';

export const equipmentRouter = Router();

equipmentRouter.use(authenticate);
equipmentRouter.get('/', validateQuery(equipmentQuerySchema), listEquipmentController);
equipmentRouter.get(
  '/:id/availability',
  validateParams(equipmentIdSchema),
  validateQuery(availabilityQuerySchema),
  equipmentAvailabilityController,
);
equipmentRouter.get(
  '/:id/alternatives',
  validateParams(equipmentIdSchema),
  validateQuery(availabilityQuerySchema),
  bookingAlternativesController,
);
equipmentRouter.get('/:id', validateParams(equipmentIdSchema), equipmentDetailController);
