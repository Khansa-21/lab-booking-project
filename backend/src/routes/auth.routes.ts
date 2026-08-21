import { Router } from 'express';

import {
  forgotPasswordController,
  loginController,
  logoutController,
  meController,
  resetPasswordController,
  signupController,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateBody } from '../middleware/validate.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/signup', validateBody(signupSchema), signupController);
authRouter.post('/login', validateBody(loginSchema), loginController);
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPasswordController);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordController);
authRouter.post('/logout', logoutController);
authRouter.get('/me', authenticate, meController);
