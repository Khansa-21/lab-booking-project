import { RequestHandler } from 'express';

import {
  createCategory,
  createEquipment,
  getAdminResources,
  updateCategory,
  updateEquipment,
} from '../services/admin-resource.service.js';
import {
  CreateCategoryInput,
  CreateEquipmentInput,
  UpdateCategoryInput,
  UpdateEquipmentInput,
} from '../validators/admin-resource.validator.js';

export const adminResourcesController: RequestHandler = async (_request, response) => {
  response.status(200).json(await getAdminResources());
};

export const createCategoryController: RequestHandler = async (request, response) => {
  response.status(201).json({ category: await createCategory(request.body as CreateCategoryInput) });
};

export const updateCategoryController: RequestHandler = async (request, response) => {
  response.status(200).json({
    category: await updateCategory((request.validatedParams as { id: number }).id, request.body as UpdateCategoryInput),
  });
};

export const createEquipmentController: RequestHandler = async (request, response) => {
  response.status(201).json({ equipment: await createEquipment(request.body as CreateEquipmentInput) });
};

export const updateEquipmentController: RequestHandler = async (request, response) => {
  response.status(200).json({
    equipment: await updateEquipment((request.validatedParams as { id: number }).id, request.body as UpdateEquipmentInput),
  });
};
