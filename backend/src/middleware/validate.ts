import { RequestHandler } from 'express';
import { ZodError, ZodType } from 'zod';

import { AppError } from '../errors/app-error.js';

export function validateBody(schema: ZodType): RequestHandler {
  return (request, _response, next) => {
    try {
      request.body = schema.parse(request.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            400,
            'Validation failed.',
            error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          ),
        );
        return;
      }

      next(error);
    }
  };
}

function validateRequestPart(
  schema: ZodType,
  part: 'params' | 'query',
): RequestHandler {
  return (request, _response, next) => {
    try {
      const parsed = schema.parse(request[part]);
      if (part === 'params') request.validatedParams = parsed;
      else request.validatedQuery = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            400,
            'Validation failed.',
            error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          ),
        );
        return;
      }

      next(error);
    }
  };
}

export const validateParams = (schema: ZodType): RequestHandler =>
  validateRequestPart(schema, 'params');

export const validateQuery = (schema: ZodType): RequestHandler =>
  validateRequestPart(schema, 'query');
