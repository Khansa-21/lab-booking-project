import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CategoriesResponse,
  EquipmentDetailResponse,
  EquipmentFilters,
  EquipmentListResponse,
  AvailabilityResponse,
  BookingAlternativesResponse,
} from './equipment.models';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/equipment`;

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${environment.apiUrl}/categories`);
  }

  getEquipment(filters: EquipmentFilters = {}): Observable<EquipmentListResponse> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<EquipmentListResponse>(this.apiUrl, { params });
  }

  getEquipmentById(id: number): Observable<EquipmentDetailResponse> {
    return this.http.get<EquipmentDetailResponse>(`${this.apiUrl}/${id}`);
  }

  getAvailability(id: number, start: Date, end: Date): Observable<AvailabilityResponse> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<AvailabilityResponse>(`${this.apiUrl}/${id}/availability`, { params });
  }

  getBookingAlternatives(
    id: number,
    start: Date,
    end: Date,
  ): Observable<BookingAlternativesResponse> {
    const params = new HttpParams()
      .set('start', start.toISOString())
      .set('end', end.toISOString());
    return this.http.get<BookingAlternativesResponse>(`${this.apiUrl}/${id}/alternatives`, {
      params,
    });
  }
}
