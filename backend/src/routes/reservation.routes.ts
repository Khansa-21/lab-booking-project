import { Router } from 'express';

import {
  cancelReservationController,
  createReservationController,
  myReservationsController,
  operationsSummaryController,
  pendingReservationsController,
  reviewReservationController,
} from '../controllers/reservation.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createReservationSchema,
  reservationIdSchema,
} from '../validators/reservation.validator.js';
import { reviewReservationSchema } from '../validators/review.validator.js';

export const reservationRouter = Router();

reservationRouter.use(authenticate);
reservationRouter.get('/mine', myReservationsController);
reservationRouter.get('/pending', authorize('TEACHER', 'ADMIN'), pendingReservationsController);
reservationRouter.get('/operations-summary', authorize('ADMIN'), operationsSummaryController);
reservationRouter.post('/', validateBody(createReservationSchema), createReservationController);
reservationRouter.patch(
  '/:id/cancel',
  validateParams(reservationIdSchema),
  cancelReservationController,
);
reservationRouter.patch(
  '/:id/review',
  authorize('TEACHER', 'ADMIN'),
  validateParams(reservationIdSchema),
  validateBody(reviewReservationSchema),
  reviewReservationController,
);
