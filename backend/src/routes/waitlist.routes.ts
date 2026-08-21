import { Router } from 'express';

import {
  cancelWaitlistController,
  joinWaitlistController,
  myWaitlistController,
} from '../controllers/waitlist.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { createReservationSchema, reservationIdSchema } from '../validators/reservation.validator.js';

export const waitlistRouter = Router();

waitlistRouter.use(authenticate);
waitlistRouter.get('/mine', myWaitlistController);
waitlistRouter.post('/', validateBody(createReservationSchema), joinWaitlistController);
waitlistRouter.patch('/:id/cancel', validateParams(reservationIdSchema), cancelWaitlistController);
