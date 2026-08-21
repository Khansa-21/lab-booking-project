import { CookieOptions, Response } from 'express';

import { environment } from '../config/environment.js';

export const AUTH_COOKIE_NAME = 'lab_booking_token';

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: environment.isProduction,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000,
    path: '/',
  };
}

export function setAuthCookie(response: Response, token: string): void {
  response.cookie(AUTH_COOKIE_NAME, token, cookieOptions());
}

export function clearAuthCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, cookieOptions());
}
