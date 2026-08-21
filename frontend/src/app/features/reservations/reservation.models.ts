export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW';

export interface ReservationEquipment {
  id: number;
  name: string;
  location: string;
  category: { id: number; name: string };
}

export interface ReservationUser {
  id: number;
  name: string;
  email: string;
}

export interface Reservation {
  id: number;
  equipmentId: number;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  status: ReservationStatus;
  checkInCode: string | null;
  checkedInAt: string | null;
  equipment?: ReservationEquipment;
  user?: ReservationUser;
}

export interface CreateReservationRequest {
  equipmentId: number;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
}

export interface ReservationResponse {
  reservation: Reservation;
}

export interface ReservationListResponse {
  reservations: Reservation[];
}

export interface OperationsSummary {
  todayReservations: number;
  pendingApprovals: number;
  maintenanceIssues: number;
  noShows: number;
  attention: Array<{ label: string; detail: string; link: string }>;
  utilization: Array<{ category: string; percent: number }>;
  hiddenUtilizationCount: number;
}

export interface OperationsSummaryResponse {
  summary: OperationsSummary;
}
