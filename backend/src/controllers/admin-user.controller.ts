import { RequestHandler } from 'express';

import { createTeacher, getAdminUsers } from '../services/admin-user.service.js';
import { CreateTeacherInput } from '../validators/admin-user.validator.js';

export const adminUsersController: RequestHandler = async (_request, response) => {
  response.status(200).json({ users: await getAdminUsers() });
};

export const createTeacherController: RequestHandler = async (request, response) => {
  response.status(201).json({ teacher: await createTeacher(request.body as CreateTeacherInput) });
};
