import { Router } from 'express';

import { listCategoriesController } from '../controllers/equipment.controller.js';
import { authenticate } from '../middleware/authenticate.js';

export const categoryRouter = Router();

categoryRouter.use(authenticate);
categoryRouter.get('/', listCategoriesController);
