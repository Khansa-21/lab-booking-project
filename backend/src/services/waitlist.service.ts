import { randomUUID } from 'node:crypto';

import { Op, Transaction } from 'sequelize';

import { sequelize } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Category, Equipment, Reservation, User, WaitlistEntry } from '../models/index.js';
import { CreateReservationInput } from '../validators/reservation.validator.js';
import { SafeUser } from './auth.service.js';
import { hasTrainingEligibility, requireTrainingEligibility } from './training.service.js';

const blockingStatuses = ['PENDING', 'APPROVED'] as const;

export async function joinWaitlist(
  input: CreateReservationInput,
  user: SafeUser,
): Promise<WaitlistEntry> {
  if (user.role === 'ADMIN') throw new AppError(403, 'Administrators cannot join a waitlist.');
  if (input.startDateTime <= new Date() || input.endDateTime <= input.startDateTime) {
    throw new AppError(400, 'Enter a valid future time range.');
  }

  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (transaction) => {
      const equipment = await Equipment.findByPk(input.equipmentId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!equipment || equipment.status !== 'AVAILABLE') {
        throw new AppError(409, 'This resource is not available for waitlisting.');
      }
      if (user.role === 'STUDENT' && equipment.bookingAudience === 'TEACHER_ONLY') {
        throw new AppError(403, 'This resource can only be booked by teachers.');
      }
      await requireTrainingEligibility(user.id, equipment, transaction);

      const durationHours =
        (input.endDateTime.getTime() - input.startDateTime.getTime()) / 3_600_000;
      if (durationHours > Number(equipment.maxBookingHours)) {
        throw new AppError(400, `Booking cannot exceed ${equipment.maxBookingHours} hours.`);
      }

      const conflict = await findBlockingReservation(input, transaction);
      if (!conflict) {
        throw new AppError(409, 'This slot is available. Create a reservation instead.');
      }

      const duplicate = await WaitlistEntry.findOne({
        where: {
          userId: user.id,
          equipmentId: input.equipmentId,
          startDateTime: input.startDateTime,
          endDateTime: input.endDateTime,
          status: 'WAITING',
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (duplicate) throw new AppError(409, 'You are already waiting for this slot.');

      return WaitlistEntry.create(
        {
          userId: user.id,
          equipmentId: input.equipmentId,
          startDateTime: input.startDateTime,
          endDateTime: input.endDateTime,
          purpose: input.purpose,
          status: 'WAITING',
        },
        { transaction },
      );
    },
  );
}

export async function getUserWaitlist(userId: number): Promise<WaitlistEntry[]> {
  return WaitlistEntry.findAll({
    where: { userId },
    include: [
      {
        model: Equipment,
        as: 'equipment',
        attributes: ['id', 'name', 'location'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function cancelWaitlistEntry(id: number, userId: number): Promise<WaitlistEntry> {
  const entry = await WaitlistEntry.findOne({ where: { id, userId } });
  if (!entry) throw new AppError(404, 'Waitlist entry not found.');
  if (entry.status !== 'WAITING') throw new AppError(409, 'This waitlist entry cannot be cancelled.');

  entry.status = 'CANCELLED';
  await entry.save();
  return entry;
}

export async function promoteWaitlistForReleasedReservation(
  releasedReservation: Reservation,
  transaction: Transaction,
): Promise<void> {
  const equipment = await Equipment.findByPk(releasedReservation.equipmentId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!equipment || equipment.status !== 'AVAILABLE') return;

  const candidates = await WaitlistEntry.findAll({
    where: {
      equipmentId: equipment.id,
      status: 'WAITING',
      startDateTime: { [Op.lt]: releasedReservation.endDateTime },
      endDateTime: { [Op.gt]: releasedReservation.startDateTime },
    },
    order: [['createdAt', 'ASC']],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  for (const entry of candidates) {
    const user = await User.findByPk(entry.userId, { transaction });
    const durationHours =
      (entry.endDateTime.getTime() - entry.startDateTime.getTime()) / 3_600_000;
    if (
      !user ||
      !user.isActive ||
      user.role === 'ADMIN' ||
      (user.role === 'STUDENT' && equipment.bookingAudience === 'TEACHER_ONLY') ||
      durationHours > Number(equipment.maxBookingHours)
    ) {
      continue;
    }
    if (!(await hasTrainingEligibility(entry.userId, equipment.id, transaction))) continue;

    const conflict = await findBlockingReservation(entry, transaction);
    if (conflict) continue;

    await Reservation.create(
      {
        userId: entry.userId,
        equipmentId: entry.equipmentId,
        startDateTime: entry.startDateTime,
        endDateTime: entry.endDateTime,
        purpose: entry.purpose,
        status: equipment.requiresApproval ? 'PENDING' : 'APPROVED',
        reviewedBy: null,
        reviewedAt: null,
        checkInCode: randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase(),
        checkedInAt: null,
      },
      { transaction },
    );
    entry.status = 'PROMOTED';
    await entry.save({ transaction });
    return;
  }
}

async function findBlockingReservation(
  input: Pick<WaitlistEntry, 'equipmentId' | 'startDateTime' | 'endDateTime'> | CreateReservationInput,
  transaction: Transaction,
): Promise<Reservation | null> {
  return Reservation.findOne({
    where: {
      equipmentId: input.equipmentId,
      status: { [Op.in]: [...blockingStatuses] },
      startDateTime: { [Op.lt]: input.endDateTime },
      endDateTime: { [Op.gt]: input.startDateTime },
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}
