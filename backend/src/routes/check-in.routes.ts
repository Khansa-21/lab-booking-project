import { Router } from 'express';

import { checkInController, todayCheckInsController } from '../controllers/check-in.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody } from '../middleware/validate.js';
import { checkInSchema } from '../validators/check-in.validator.js';

export const checkInRouter = Router();

checkInRouter.use(authenticate, authorize('TEACHER', 'ADMIN'));
checkInRouter.get('/today', todayCheckInsController);
checkInRouter.post('/', validateBody(checkInSchema), checkInController);
