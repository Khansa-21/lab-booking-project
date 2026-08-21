import { Op, Transaction } from 'sequelize';

import { sequelize } from '../config/database.js';
import { AppError } from '../errors/app-error.js';
import { Category, Equipment, Reservation, User } from '../models/index.js';
import { promoteWaitlistForReleasedReservation } from './waitlist.service.js';

const graceMinutes = 30;

export async function checkIn(code: string): Promise<Reservation> {
  return sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (transaction) => {
      const reservation = await Reservation.findOne({
        where: { checkInCode: code, status: 'APPROVED' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!reservation) throw new AppError(404, 'Active approved reservation not found for this code.');
      const now = new Date();
      const opensAt = new Date(reservation.startDateTime.getTime() - 15 * 60_000);
      const closesAt = new Date(reservation.startDateTime.getTime() + graceMinutes * 60_000);
      if (now < opensAt || now > closesAt) {
        throw new AppError(409, 'Check-in is available from 15 minutes before until 30 minutes after the start time.');
      }
      reservation.checkedInAt = now;
      await reservation.save({ transaction });
      return reservation;
    },
  );
}

export async function getTodayCheckIns(): Promise<Reservation[]> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  return Reservation.findAll({
    where: {
      status: { [Op.in]: ['APPROVED', 'NO_SHOW'] },
      startDateTime: { [Op.gte]: todayStart, [Op.lt]: tomorrowStart },
    },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Equipment, as: 'equipment', attributes: ['id', 'name', 'location'], include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }] },
    ],
    order: [['startDateTime', 'ASC']],
  });
}

export async function markNoShows(): Promise<number> {
  const cutoff = new Date(Date.now() - graceMinutes * 60_000);
  const candidates = await Reservation.findAll({
    where: { status: 'APPROVED', checkedInAt: null, startDateTime: { [Op.lte]: cutoff } },
    attributes: ['id'],
  });

  let released = 0;
  for (const candidate of candidates) {
    const changed = await sequelize.transaction(
      { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
      async (transaction) => {
        const reservation = await Reservation.findOne({
          where: { id: candidate.id, status: 'APPROVED', checkedInAt: null },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!reservation || reservation.startDateTime > cutoff) return false;
        reservation.status = 'NO_SHOW';
        await reservation.save({ transaction });
        await promoteWaitlistForReleasedReservation(reservation, transaction);
        return true;
      },
    );
    if (changed) released += 1;
  }
  return released;
}

export async function markCompletedReservations(): Promise<number> {
  const [updated] = await Reservation.update(
    { status: 'COMPLETED' },
    {
      where: {
        status: 'APPROVED',
        checkedInAt: { [Op.ne]: null },
        endDateTime: { [Op.lte]: new Date() },
      },
    },
  );
  return updated;
}
