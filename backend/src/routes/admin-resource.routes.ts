import { Router } from 'express';

import {
  adminResourcesController,
  createCategoryController,
  createEquipmentController,
  updateCategoryController,
  updateEquipmentController,
} from '../controllers/admin-resource.controller.js';
import { adminUsersController, createTeacherController } from '../controllers/admin-user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { equipmentIdSchema } from '../validators/equipment.validator.js';
import {
  createCategorySchema,
  createEquipmentSchema,
  updateCategorySchema,
  updateEquipmentSchema,
} from '../validators/admin-resource.validator.js';
import { createTeacherSchema } from '../validators/admin-user.validator.js';

export const adminResourceRouter = Router();

adminResourceRouter.use(authenticate, authorize('ADMIN'));
adminResourceRouter.get('/resources', adminResourcesController);
adminResourceRouter.post('/categories', validateBody(createCategorySchema), createCategoryController);
adminResourceRouter.patch(
  '/categories/:id',
  validateParams(equipmentIdSchema),
  validateBody(updateCategorySchema),
  updateCategoryController,
);
adminResourceRouter.get('/users', adminUsersController);
adminResourceRouter.post('/users/teachers', validateBody(createTeacherSchema), createTeacherController);
adminResourceRouter.post('/equipment', validateBody(createEquipmentSchema), createEquipmentController);
adminResourceRouter.patch(
  '/equipment/:id',
  validateParams(equipmentIdSchema),
  validateBody(updateEquipmentSchema),
  updateEquipmentController,
);
