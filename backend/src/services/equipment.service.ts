import { Attributes, IncludeOptions, Op, WhereOptions } from 'sequelize';

import { AppError } from '../errors/app-error.js';
import { Category, Equipment, Reservation } from '../models/index.js';
import { UserRole } from '../models/model-values.js';
import {
  AvailabilityQuery,
  EquipmentQuery,
} from '../validators/equipment.validator.js';

const categoryInclude: IncludeOptions = {
  model: Category,
  as: 'category',
  attributes: ['id', 'name'],
  where: { isActive: true },
  required: true,
};

function accessibleEquipmentWhere(
  role: UserRole,
): WhereOptions<Attributes<Equipment>> {
  return role === 'STUDENT'
    ? { bookingAudience: 'STUDENT_AND_TEACHER' }
    : {};
}

export async function getCategories(): Promise<Category[]> {
  return Category.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });
}

export async function getEquipment(
  query: EquipmentQuery,
  role: UserRole,
): Promise<Equipment[]> {
  const conditions: WhereOptions<Attributes<Equipment>>[] = [
    accessibleEquipmentWhere(role),
  ];

  if (query.categoryId) conditions.push({ categoryId: query.categoryId });
  if (query.status) conditions.push({ status: query.status });
  if (query.search) {
    conditions.push({
      [Op.or]: [
        { name: { [Op.like]: `%${query.search}%` } },
        { location: { [Op.like]: `%${query.search}%` } },
      ],
    });
  }

  return Equipment.findAll({
    where: { [Op.and]: conditions },
    include: [categoryInclude],
    order: [['name', 'ASC']],
  });
}

export async function getEquipmentById(
  id: number,
  role: UserRole,
): Promise<Equipment> {
  const equipment = await Equipment.findOne({
    where: { id, ...accessibleEquipmentWhere(role) },
    include: [categoryInclude],
  });

  if (!equipment) {
    throw new AppError(404, 'Equipment not found.');
  }

  return equipment;
}

export async function getEquipmentAvailability(
  id: number,
  query: AvailabilityQuery,
  role: UserRole,
): Promise<{ startDateTime: Date; endDateTime: Date }[]> {
  await getEquipmentById(id, role);

  const reservations = await Reservation.findAll({
    where: {
      equipmentId: id,
      status: { [Op.in]: ['PENDING', 'APPROVED'] },
      startDateTime: { [Op.lt]: query.end },
      endDateTime: { [Op.gt]: query.start },
    },
    attributes: ['startDateTime', 'endDateTime'],
    order: [['startDateTime', 'ASC']],
  });

  return reservations.map((reservation) => ({
    startDateTime: reservation.startDateTime,
    endDateTime: reservation.endDateTime,
  }));
}

export async function getBookingAlternatives(
  id: number,
  query: AvailabilityQuery,
  role: UserRole,
): Promise<{
  nextSlot: { startDateTime: Date; endDateTime: Date } | null;
  alternativeResources: Pick<Equipment, 'id' | 'name' | 'location'>[];
}> {
  const equipment = await getEquipmentById(id, role);
  const duration = query.end.getTime() - query.start.getTime();

  if (duration / 3_600_000 > Number(equipment.maxBookingHours)) {
    throw new AppError(400, `Booking cannot exceed ${equipment.maxBookingHours} hours.`);
  }

  const nextSlot = await findNextFreeSlot(equipment, query.start, duration);
  const candidates = await Equipment.findAll({
    where: {
      categoryId: equipment.categoryId,
      id: { [Op.ne]: equipment.id },
      status: 'AVAILABLE',
      ...accessibleEquipmentWhere(role),
    },
    attributes: ['id', 'name', 'location'],
    order: [['name', 'ASC']],
  });

  if (candidates.length === 0) return { nextSlot, alternativeResources: [] };

  const conflicts = await Reservation.findAll({
    where: {
      equipmentId: { [Op.in]: candidates.map((candidate) => candidate.id) },
      status: { [Op.in]: ['PENDING', 'APPROVED'] },
      startDateTime: { [Op.lt]: query.end },
      endDateTime: { [Op.gt]: query.start },
    },
    attributes: ['equipmentId'],
  });
  const blockedEquipmentIds = new Set(conflicts.map((conflict) => conflict.equipmentId));

  return {
    nextSlot,
    alternativeResources: candidates
      .filter((candidate) => !blockedEquipmentIds.has(candidate.id))
      .slice(0, 3),
  };
}

async function findNextFreeSlot(
  equipment: Equipment,
  requestedStart: Date,
  duration: number,
): Promise<{ startDateTime: Date; endDateTime: Date } | null> {
  if (equipment.status !== 'AVAILABLE') return null;

  const searchEnd = new Date(requestedStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  const reservations = await Reservation.findAll({
    where: {
      equipmentId: equipment.id,
      status: { [Op.in]: ['PENDING', 'APPROVED'] },
      endDateTime: { [Op.gt]: requestedStart },
      startDateTime: { [Op.lt]: searchEnd },
    },
    attributes: ['startDateTime', 'endDateTime'],
    order: [['startDateTime', 'ASC']],
  });

  let candidateStart = requestedStart;
  for (const reservation of reservations) {
    const candidateEnd = new Date(candidateStart.getTime() + duration);
    if (reservation.endDateTime <= candidateStart) continue;
    if (reservation.startDateTime >= candidateEnd) break;
    candidateStart = reservation.endDateTime;
  }

  const candidateEnd = new Date(candidateStart.getTime() + duration);
  return candidateEnd <= searchEnd
    ? { startDateTime: candidateStart, endDateTime: candidateEnd }
    : null;
}
