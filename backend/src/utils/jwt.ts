import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

import { environment } from '../config/environment.js';
import { UserRole } from '../models/model-values.js';

interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(userId: number, role: UserRole): string {
  return jwt.sign({ role }, environment.jwtSecret, {
    subject: String(userId),
    expiresIn: environment.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, environment.jwtSecret);

  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    !['STUDENT', 'TEACHER', 'ADMIN'].includes(String(payload.role))
  ) {
    throw new Error('Invalid token payload.');
  }

  return payload as AccessTokenPayload;
}
