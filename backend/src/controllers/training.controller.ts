import { RequestHandler } from 'express';

import { getAuthenticatedUser } from '../middleware/authenticate.js';
import {
  completeTraining,
  getMyTraining,
  getTrainingManagementData,
  searchEligibleUsers,
} from '../services/training.service.js';
import { CompleteTrainingInput } from '../validators/training.validator.js';
import { TrainingUserSearch } from '../validators/training.validator.js';

export const myTrainingController: RequestHandler = async (request, response) => {
  response.status(200).json({ records: await getMyTraining(getAuthenticatedUser(request).id) });
};

export const trainingManagementController: RequestHandler = async (_request, response) => {
  response.status(200).json(await getTrainingManagementData());
};

export const searchTrainingUsersController: RequestHandler = async (request, response) => {
  response.status(200).json({
    users: await searchEligibleUsers((request.validatedQuery as TrainingUserSearch).search),
  });
};

export const completeTrainingController: RequestHandler = async (request, response) => {
  response.status(201).json({
    record: await completeTraining(
      request.body as CompleteTrainingInput,
      getAuthenticatedUser(request).id,
    ),
  });
};
