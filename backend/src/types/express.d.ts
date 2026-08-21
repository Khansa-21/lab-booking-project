import { SafeUser } from '../services/auth.service.js';

declare global {
  namespace Express {
    interface Request {
      authUser?: SafeUser;
      validatedParams?: unknown;
      validatedQuery?: unknown;
    }
  }
}

export {};
