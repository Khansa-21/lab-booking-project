import { RequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';
import { UserRole } from '../models/model-values.js';

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    if (!request.authUser) {
      next(new AppError(401, 'Authentication required.'));
      return;
    }

    if (!allowedRoles.includes(request.authUser.role)) {
      next(new AppError(403, 'You do not have permission for this action.'));
      return;
    }

    next();
  };
}
