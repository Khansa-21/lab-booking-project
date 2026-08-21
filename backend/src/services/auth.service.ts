import bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { UniqueConstraintError } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { environment } from '../config/environment.js';
import { User } from '../models/index.js';
import { UserRole } from '../models/model-values.js';
import { sendPasswordResetEmail } from './email.service.js';
import { signAccessToken } from '../utils/jwt.js';

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function signup(input: SignupInput): Promise<{
  token: string;
  user: SafeUser;
}> {
  const email = input.email.toLowerCase();

  try {
    const user = await User.create({
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: 'STUDENT',
    });

    return {
      token: signAccessToken(user.id, user.role),
      user: toSafeUser(user),
    };
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'An account with this email already exists.');
    }

    throw error;
  }
}

export async function login(input: LoginInput): Promise<{
  token: string;
  user: SafeUser;
}> {
  const user = await User.findOne({
    where: { email: input.email.toLowerCase() },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new AppError(403, 'This account is inactive.');
  }

  return {
    token: signAccessToken(user.id, user.role),
    user: toSafeUser(user),
  };
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ where: { email: email.toLowerCase() } });

  if (!user || !user.isActive) return;

  const token = randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashResetToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const resetUrl = new URL('/reset-password', environment.frontendOrigin);
  resetUrl.searchParams.set('token', token);

  await sendPasswordResetEmail({
    name: user.name,
    email: user.email,
    resetUrl: resetUrl.toString(),
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const user = await User.findOne({
    where: { passwordResetTokenHash: hashResetToken(input.token) },
  });

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt <= new Date()) {
    throw new AppError(400, 'This reset link is invalid or has expired.');
  }

  user.passwordHash = await bcrypt.hash(input.password, 12);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  await user.save();
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
