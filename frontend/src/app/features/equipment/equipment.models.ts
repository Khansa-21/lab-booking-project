export type EquipmentStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
export type BookingAudience = 'STUDENT_AND_TEACHER' | 'TEACHER_ONLY';

export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Equipment {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  location: string;
  imageUrl: string | null;
  status: EquipmentStatus;
  bookingAudience: BookingAudience;
  requiresApproval: boolean;
  requiresTraining: boolean;
  maxBookingHours: string;
  category: Pick<Category, 'id' | 'name'>;
}

export interface EquipmentFilters {
  search?: string;
  categoryId?: number;
  status?: EquipmentStatus;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface EquipmentListResponse {
  equipment: Equipment[];
}

export interface EquipmentDetailResponse {
  equipment: Equipment;
}

export interface AvailabilityInterval {
  startDateTime: string;
  endDateTime: string;
}

export interface AvailabilityResponse {
  availability: AvailabilityInterval[];
}

export interface AlternativeResource {
  id: number;
  name: string;
  location: string;
}

export interface BookingAlternatives {
  nextSlot: AvailabilityInterval | null;
  alternativeResources: AlternativeResource[];
}

export interface BookingAlternativesResponse {
  alternatives: BookingAlternatives;
}
