export const USER_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EQUIPMENT_STATUSES = [
  'AVAILABLE',
  'UNAVAILABLE',
  'MAINTENANCE',
] as const;
export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export const BOOKING_AUDIENCES = [
  'STUDENT_AND_TEACHER',
  'TEACHER_ONLY',
] as const;
export type BookingAudience = (typeof BOOKING_AUDIENCES)[number];

export const RESERVATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const WAITLIST_STATUSES = ['WAITING', 'PROMOTED', 'CANCELLED'] as const;
export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];
