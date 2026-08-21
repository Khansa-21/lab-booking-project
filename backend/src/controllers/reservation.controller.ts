import { RequestHandler } from 'express';

import { getAuthenticatedUser } from '../middleware/authenticate.js';
import {
  cancelReservation,
  createReservation,
  getOperationsSummary,
  getPendingReservations,
  getUserReservations,
  reviewReservation,
} from '../services/reservation.service.js';
import { CreateReservationInput } from '../validators/reservation.validator.js';
import { ReviewReservationInput } from '../validators/review.validator.js';

export const createReservationController: RequestHandler = async (request, response) => {
  const reservation = await createReservation(
    request.body as CreateReservationInput,
    getAuthenticatedUser(request),
  );
  response.status(201).json({ reservation });
};

export const myReservationsController: RequestHandler = async (request, response) => {
  const reservations = await getUserReservations(getAuthenticatedUser(request).id);
  response.status(200).json({ reservations });
};

export const cancelReservationController: RequestHandler = async (request, response) => {
  const reservation = await cancelReservation(
    (request.validatedParams as { id: number }).id,
    getAuthenticatedUser(request).id,
  );
  response.status(200).json({ reservation });
};

export const pendingReservationsController: RequestHandler = async (_request, response) => {
  response.status(200).json({ reservations: await getPendingReservations() });
};

export const reviewReservationController: RequestHandler = async (request, response) => {
  const reservation = await reviewReservation(
    (request.validatedParams as { id: number }).id,
    getAuthenticatedUser(request).id,
    request.body as ReviewReservationInput,
  );
  response.status(200).json({ reservation });
};

export const operationsSummaryController: RequestHandler = async (_request, response) => {
  response.set('Cache-Control', 'no-store');
  response.status(200).json({ summary: await getOperationsSummary() });
};
