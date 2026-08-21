import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { BookingAudience, Equipment, EquipmentStatus } from '../equipment/equipment.models';

export interface AdminCategory {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface AdminResourceData {
  categories: AdminCategory[];
  equipment: Equipment[];
}

export interface CategoryRequest {
  name: string;
  description: string | null;
  isActive?: boolean;
}

export interface EquipmentRequest {
  categoryId: number;
  name: string;
  description: string | null;
  location: string;
  imageUrl: string | null;
  status: EquipmentStatus;
  bookingAudience: BookingAudience;
  requiresApproval: boolean;
  requiresTraining: boolean;
  maxBookingHours: number;
}

@Injectable({ providedIn: 'root' })
export class AdminResourceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  getResources(): Observable<AdminResourceData> {
    return this.http.get<AdminResourceData>(`${this.apiUrl}/resources`);
  }

  createCategory(request: CategoryRequest): Observable<{ category: AdminCategory }> {
    return this.http.post<{ category: AdminCategory }>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(id: number, request: CategoryRequest): Observable<{ category: AdminCategory }> {
    return this.http.patch<{ category: AdminCategory }>(`${this.apiUrl}/categories/${id}`, request);
  }

  createEquipment(request: EquipmentRequest): Observable<{ equipment: Equipment }> {
    return this.http.post<{ equipment: Equipment }>(`${this.apiUrl}/equipment`, request);
  }

  updateEquipment(id: number, request: EquipmentRequest): Observable<{ equipment: Equipment }> {
    return this.http.patch<{ equipment: Equipment }>(`${this.apiUrl}/equipment/${id}`, request);
  }
}
