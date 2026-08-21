import { RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';
import { login, requestPasswordReset, resetPassword, signup } from '../services/auth.service.js';
import { clearAuthCookie, setAuthCookie } from '../utils/auth-cookie.js';

export const signupController: RequestHandler = async (request, response) => {
  const result = await signup(request.body);
  setAuthCookie(response, result.token);
  response.status(201).json({ user: result.user });
};

export const loginController: RequestHandler = async (request, response) => {
  const result = await login(request.body);
  setAuthCookie(response, result.token);
  response.status(200).json({ user: result.user });
};

export const logoutController: RequestHandler = (_request, response) => {
  clearAuthCookie(response);
  response.status(204).send();
};

export const forgotPasswordController: RequestHandler = async (request, response) => {
  await requestPasswordReset(request.body.email);
  response.status(204).send();
};

export const resetPasswordController: RequestHandler = async (request, response) => {
  await resetPassword(request.body);
  response.status(204).send();
};

export const meController: RequestHandler = (request, response) => {
  if (!request.authUser) {
    throw new AppError(401, 'Authentication required.');
  }

  response.status(200).json({ user: request.authUser });
};
