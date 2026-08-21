export type WaitlistStatus = 'WAITING' | 'PROMOTED' | 'CANCELLED';

export interface WaitlistEntry {
  id: number;
  equipmentId: number;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  status: WaitlistStatus;
  equipment?: { id: number; name: string; location: string; category: { id: number; name: string } };
}

export interface JoinWaitlistRequest {
  equipmentId: number;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
}

export interface WaitlistEntryResponse { entry: WaitlistEntry; }
export interface WaitlistListResponse { entries: WaitlistEntry[]; }
