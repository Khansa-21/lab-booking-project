import { randomUUID } from 'node:crypto';

import { Op, Transaction } from 'sequelize';

import { sequelize } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Category, Equipment, Reservation, User } from '../models/index.js';
import { SafeUser } from './auth.service.js';
import { CreateReservationInput } from '../validators/reservation.validator.js';
import { ReviewReservationInput } from '../validators/review.validator.js';
import { promoteWaitlistForReleasedReservation } from './waitlist.service.js';
import { requireTrainingEligibility } from './training.service.js';

const blockingStatuses = ['PENDING', 'APPROVED'] as const;

export async function createReservation(
  input: CreateReservationInput,
  user: SafeUser,
): Promise<Reservation> {
  if (user.role === 'ADMIN') {
    throw new AppError(403, 'Administrators cannot create reservations.');
  }

  const now = new Date();
  if (input.startDateTime <= now) {
    throw new AppError(400, 'Start time must be in the future.');
  }
  if (input.endDateTime <= input.startDateTime) {
    throw new AppError(400, 'End time must be after start time.');
  }

  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (transaction) => {
      const equipment = await Equipment.findByPk(input.equipmentId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!equipment) throw new AppError(404, 'Equipment not found.');
      if (equipment.status !== 'AVAILABLE') {
        throw new AppError(409, 'This equipment is currently unavailable.');
      }
      if (user.role === 'STUDENT' && equipment.bookingAudience === 'TEACHER_ONLY') {
        throw new AppError(403, 'This equipment can only be booked by teachers.');
      }
      await requireTrainingEligibility(user.id, equipment, transaction);

      const durationHours =
        (input.endDateTime.getTime() - input.startDateTime.getTime()) / 3_600_000;
      if (durationHours > Number(equipment.maxBookingHours)) {
        throw new AppError(
          400,
          `Booking cannot exceed ${equipment.maxBookingHours} hours.`,
        );
      }

      const overlap = await Reservation.findOne({
        where: {
          equipmentId: equipment.id,
          status: { [Op.in]: [...blockingStatuses] },
          startDateTime: { [Op.lt]: input.endDateTime },
          endDateTime: { [Op.gt]: input.startDateTime },
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (overlap) {
        throw new AppError(409, 'This equipment is already booked for that time.');
      }

      return Reservation.create(
        {
          userId: user.id,
          equipmentId: equipment.id,
          startDateTime: input.startDateTime,
          endDateTime: input.endDateTime,
          purpose: input.purpose,
          status: equipment.requiresApproval ? 'PENDING' : 'APPROVED',
          reviewedBy: null,
          reviewedAt: null,
          checkInCode: createCheckInCode(),
          checkedInAt: null,
        },
        { transaction },
      );
    },
  );
}

function createCheckInCode(): string {
  return randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
}

export async function getUserReservations(userId: number): Promise<Reservation[]> {
  return Reservation.findAll({
    where: { userId },
    include: [
      {
        model: Equipment,
        as: 'equipment',
        attributes: ['id', 'name', 'location'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
    order: [['startDateTime', 'DESC']],
  });
}

export async function cancelReservation(
  id: number,
  userId: number,
): Promise<Reservation> {
  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (transaction) => {
      const reservation = await Reservation.findOne({
        where: { id, userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!reservation) throw new AppError(404, 'Reservation not found.');
      if (!blockingStatuses.includes(reservation.status as (typeof blockingStatuses)[number])) {
        throw new AppError(409, 'This reservation can no longer be cancelled.');
      }
      if (reservation.startDateTime <= new Date()) {
        throw new AppError(409, 'A started reservation cannot be cancelled.');
      }

      reservation.status = 'CANCELLED';
      await reservation.save({ transaction });
      await promoteWaitlistForReleasedReservation(reservation, transaction);
      return reservation;
    },
  );
}

export async function getPendingReservations(): Promise<Reservation[]> {
  return Reservation.findAll({
    where: { status: 'PENDING' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      {
        model: Equipment,
        as: 'equipment',
        attributes: ['id', 'name', 'location'],
        include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      },
    ],
    order: [['startDateTime', 'ASC']],
  });
}

export async function reviewReservation(
  id: number,
  reviewerId: number,
  input: ReviewReservationInput,
): Promise<Reservation> {
  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (transaction) => {
      const reservation = await Reservation.findByPk(id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!reservation) throw new AppError(404, 'Reservation not found.');
      if (reservation.status !== 'PENDING') {
        throw new AppError(409, 'Only pending reservations can be reviewed.');
      }

      reservation.status = input.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      reservation.reviewedBy = reviewerId;
      reservation.reviewedAt = new Date();
      await reservation.save({ transaction });
      if (reservation.status === 'REJECTED') {
        await promoteWaitlistForReleasedReservation(reservation, transaction);
      }
      return reservation;
    },
  );
}

export async function getOperationsSummary(): Promise<{
  todayReservations: number;
  pendingApprovals: number;
  maintenanceIssues: number;
  noShows: number;
  attention: { label: string; detail: string; link: string }[];
  utilization: { category: string; percent: number }[];
  hiddenUtilizationCount: number;
}> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const [todayReservations, pendingApprovals, maintenanceItems, noShows, categories, equipment, bookings] = await Promise.all([
    Reservation.count({
      where: {
        status: { [Op.in]: ['PENDING', 'APPROVED', 'COMPLETED', 'NO_SHOW'] },
        startDateTime: { [Op.lt]: tomorrowStart },
        endDateTime: { [Op.gt]: todayStart },
      },
    }),
    Reservation.count({ where: { status: 'PENDING' } }),
    Equipment.findAll({ where: { status: 'MAINTENANCE' }, attributes: ['name'], limit: 3 }),
    Reservation.count({ where: { status: 'NO_SHOW', startDateTime: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart } } }),
    Category.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
    Equipment.findAll({ where: { status: { [Op.ne]: 'MAINTENANCE' } }, attributes: ['id', 'categoryId'] }),
    Reservation.findAll({
      where: { status: { [Op.in]: ['APPROVED', 'COMPLETED'] }, startDateTime: { [Op.lt]: tomorrowStart }, endDateTime: { [Op.gt]: todayStart } },
      attributes: ['equipmentId', 'startDateTime', 'endDateTime'],
    }),
  ]);
  const attention = [
    ...(pendingApprovals ? [{ label: 'Approvals waiting', detail: `${pendingApprovals} reservation(s) need review.`, link: '/admin/approvals' }] : []),
    ...maintenanceItems.map((item) => ({ label: item.name, detail: 'Maintenance reported.', link: '/admin/resources' })),
    ...(noShows ? [{ label: 'No-shows today', detail: `${noShows} reservation(s) were auto-released.`, link: '/admin/check-ins' }] : []),
  ];
  const categoryEquipment = new Map<number, number[]>();
  for (const item of equipment) {
    const resourceIds = categoryEquipment.get(item.categoryId) ?? [];
    resourceIds.push(item.id);
    categoryEquipment.set(item.categoryId, resourceIds);
  }
  const opening = new Date(todayStart);
  opening.setHours(8);
  const closing = new Date(todayStart);
  closing.setHours(20);
  const scheduledMinutes = new Map<number, number>();
  for (const booking of bookings) {
    const start = booking.startDateTime < opening ? opening : booking.startDateTime;
    const end = booking.endDateTime > closing ? closing : booking.endDateTime;
    if (end > start) scheduledMinutes.set(booking.equipmentId, (scheduledMinutes.get(booking.equipmentId) ?? 0) + (end.getTime() - start.getTime()) / 60_000);
  }
  const allUtilization = categories.map((category) => {
    const resourceIds = categoryEquipment.get(category.id) ?? [];
    const bookedMinutes = resourceIds.reduce((total, id) => total + (scheduledMinutes.get(id) ?? 0), 0);
    const capacityMinutes = resourceIds.length * 12 * 60;
    return { category: category.name, percent: capacityMinutes ? Math.round((bookedMinutes / capacityMinutes) * 100) : 0 };
  });
  const usedUtilization = allUtilization
    .filter((item) => item.percent > 0)
    .sort((first, second) => second.percent - first.percent);
  const utilization = usedUtilization.slice(0, 5);
  return {
    todayReservations,
    pendingApprovals,
    maintenanceIssues: maintenanceItems.length,
    noShows,
    attention,
    utilization,
    hiddenUtilizationCount: Math.max(0, usedUtilization.length - utilization.length),
  };
}
