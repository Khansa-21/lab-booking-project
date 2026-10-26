import { ErrorRequestHandler } from 'express';

import { AppError } from '../errors/app-error.js';

function isDatabaseConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return /ecconnrefused|econnreset|enotfound|timed out|timeout|connect.*database|database.*unavailable|cannot open server|login failed|invalid login|connection.*closed/i.test(message);
}

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

  if (isDatabaseConnectionError(error)) {
    response.status(503).json({
      error: {
        message: 'The database is temporarily unavailable. Please try again in a moment.',
      },
    });
    return;
  }

  response.status(500).json({
    error: { message: 'An unexpected error occurred.' },
  });
};
