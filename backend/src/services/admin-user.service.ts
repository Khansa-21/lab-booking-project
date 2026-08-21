import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { User } from '../models/index.js';
import { SafeUser } from './auth.service.js';
import { CreateTeacherInput } from '../validators/admin-user.validator.js';

function toSafeUser(user: User): SafeUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function getAdminUsers(): Promise<Array<SafeUser & { isActive: boolean }>> {
  const users = await User.findAll({ order: [['name', 'ASC']] });
  return users.map((user) => ({ ...toSafeUser(user), isActive: user.isActive }));
}

export async function createTeacher(
  input: CreateTeacherInput,
): Promise<SafeUser & { isActive: boolean }> {
  try {
    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: 'TEACHER',
    });
    return { ...toSafeUser(user), isActive: user.isActive };
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'An account with this email already exists.');
    }
    throw error;
  }
}
