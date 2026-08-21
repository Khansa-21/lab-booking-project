import { Op, Transaction, UniqueConstraintError } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { Category, Equipment, TrainingRecord, User } from '../models/index.js';
import { CompleteTrainingInput } from '../validators/training.validator.js';

export async function requireTrainingEligibility(
  userId: number,
  equipment: Equipment,
  transaction?: Transaction,
): Promise<void> {
  if (!equipment.requiresTraining) return;
  if (!(await hasTrainingEligibility(userId, equipment.id, transaction))) {
    throw new AppError(403, 'Training is required before booking this resource.');
  }
}

export async function hasTrainingEligibility(
  userId: number,
  equipmentId: number,
  transaction?: Transaction,
): Promise<boolean> {
  return Boolean(await TrainingRecord.findOne({ where: { userId, equipmentId }, transaction }));
}

export async function getMyTraining(userId: number): Promise<TrainingRecord[]> {
  return TrainingRecord.findAll({
    where: { userId },
    include: [
      {
        model: Equipment,
        as: 'equipment',
        attributes: ['id', 'name', 'location'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
    order: [['completedAt', 'DESC']],
  });
}

export async function getTrainingManagementData(): Promise<{
  resources: Pick<Equipment, 'id' | 'name' | 'location'>[];
  records: TrainingRecord[];
}> {
  const [resources, records] = await Promise.all([
    Equipment.findAll({
      where: { requiresTraining: true },
      attributes: ['id', 'name', 'location'],
      order: [['name', 'ASC']],
    }),
    TrainingRecord.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Equipment, as: 'equipment', attributes: ['id', 'name', 'location'] },
      ],
      order: [['completedAt', 'DESC']],
    }),
  ]);
  return { resources, records };
}

export async function searchEligibleUsers(search: string): Promise<Pick<User, 'id' | 'name' | 'email'>[]> {
  return User.findAll({
    where: {
      role: { [Op.in]: ['STUDENT', 'TEACHER'] },
      isActive: true,
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }],
    },
    attributes: ['id', 'name', 'email'],
    order: [['name', 'ASC']],
    limit: 10,
  });
}

export async function completeTraining(
  input: CompleteTrainingInput,
  completedBy: number,
): Promise<TrainingRecord> {
  const [user, equipment] = await Promise.all([
    User.findOne({ where: { id: input.userId, role: { [Op.in]: ['STUDENT', 'TEACHER'] }, isActive: true } }),
    Equipment.findByPk(input.equipmentId),
  ]);
  if (!user) throw new AppError(404, 'Active eligible user not found.');
  if (!equipment || !equipment.requiresTraining) {
    throw new AppError(400, 'Select a resource that requires training.');
  }

  try {
    return await TrainingRecord.create({
      userId: user.id,
      equipmentId: equipment.id,
      completedBy,
      completedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(409, 'This student already has training for this resource.');
    }
    throw error;
  }
}
