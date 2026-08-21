import { Request, RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';
import { User } from '../models/index.js';
import { AUTH_COOKIE_NAME } from '../utils/auth-cookie.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { SafeUser } from '../services/auth.service.js';

export function getAuthenticatedUser(request: Request): SafeUser {
  if (!request.authUser) {
    throw new AppError(401, 'Authentication required.');
  }

  return request.authUser;
}

export const authenticate: RequestHandler = async (request, _response, next) => {
  try {
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (typeof token !== 'string') {
      throw new AppError(401, 'Authentication required.');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(Number(payload.sub));

    if (!user || !user.isActive) {
      throw new AppError(401, 'Authentication required.');
    }

    request.authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired session.'));
  }
};
