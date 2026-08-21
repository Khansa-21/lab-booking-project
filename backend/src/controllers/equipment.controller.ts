import { RequestHandler } from 'express';

import { getAuthenticatedUser } from '../middleware/authenticate.js';
import {
  getCategories,
  getEquipmentAvailability,
  getBookingAlternatives,
  getEquipment,
  getEquipmentById,
} from '../services/equipment.service.js';
import {
  AvailabilityQuery,
  EquipmentQuery,
} from '../validators/equipment.validator.js';

export const listCategoriesController: RequestHandler = async (_request, response) => {
  response.status(200).json({ categories: await getCategories() });
};

export const listEquipmentController: RequestHandler = async (request, response) => {
  const equipment = await getEquipment(
    request.validatedQuery as EquipmentQuery,
    getAuthenticatedUser(request).role,
  );
  response.status(200).json({ equipment });
};

export const equipmentDetailController: RequestHandler = async (request, response) => {
  const equipment = await getEquipmentById(
    (request.validatedParams as { id: number }).id,
    getAuthenticatedUser(request).role,
  );
  response.status(200).json({ equipment });
};

export const equipmentAvailabilityController: RequestHandler = async (request, response) => {
  const availability = await getEquipmentAvailability(
    (request.validatedParams as { id: number }).id,
    request.validatedQuery as AvailabilityQuery,
    getAuthenticatedUser(request).role,
  );
  response.status(200).json({ availability });
};

export const bookingAlternativesController: RequestHandler = async (request, response) => {
  const alternatives = await getBookingAlternatives(
    (request.validatedParams as { id: number }).id,
    request.validatedQuery as AvailabilityQuery,
    getAuthenticatedUser(request).role,
  );
  response.status(200).json({ alternatives });
};
