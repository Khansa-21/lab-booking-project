import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';

import { sequelize } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Reservation, TrainingRecord, User, WaitlistEntry } from '../models/index.js';
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

export async function deleteAdminUser(id: number, currentAdminId: number): Promise<void> {
  if (id === currentAdminId) {
    throw new AppError(400, 'You cannot delete the account you are currently using.');
  }

  await sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(id, { transaction });
    if (!user) throw new AppError(404, 'User not found.');

    await Reservation.update(
      { reviewedBy: null },
      { where: { reviewedBy: id }, transaction },
    );
    await TrainingRecord.update(
      { completedBy: null },
      { where: { completedBy: id }, transaction },
    );
    await Reservation.destroy({ where: { userId: id }, transaction });
    await WaitlistEntry.destroy({ where: { userId: id }, transaction });
    await TrainingRecord.destroy({ where: { userId: id }, transaction });
    await user.destroy({ transaction });
  });
}
