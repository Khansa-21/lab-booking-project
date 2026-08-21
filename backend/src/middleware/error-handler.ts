import { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: { message: 'An unexpected error occurred.' },
  });
};
