import { RequestHandler } from 'express';

import { checkIn, getTodayCheckIns } from '../services/check-in.service.js';
import { CheckInInput } from '../validators/check-in.validator.js';

export const checkInController: RequestHandler = async (request, response) => {
  response.status(200).json({ reservation: await checkIn((request.body as CheckInInput).code) });
};

export const todayCheckInsController: RequestHandler = async (_request, response) => {
  response.status(200).json({ reservations: await getTodayCheckIns() });
};
