import { RequestHandler } from 'express';

import { getAuthenticatedUser } from '../middleware/authenticate.js';
import { CreateReservationInput } from '../validators/reservation.validator.js';
import {
  cancelWaitlistEntry,
  getUserWaitlist,
  joinWaitlist,
} from '../services/waitlist.service.js';

export const joinWaitlistController: RequestHandler = async (request, response) => {
  const entry = await joinWaitlist(request.body as CreateReservationInput, getAuthenticatedUser(request));
  response.status(201).json({ entry });
};

export const myWaitlistController: RequestHandler = async (request, response) => {
  response.status(200).json({ entries: await getUserWaitlist(getAuthenticatedUser(request).id) });
};

export const cancelWaitlistController: RequestHandler = async (request, response) => {
  const entry = await cancelWaitlistEntry(
    (request.validatedParams as { id: number }).id,
    getAuthenticatedUser(request).id,
  );
  response.status(200).json({ entry });
};
