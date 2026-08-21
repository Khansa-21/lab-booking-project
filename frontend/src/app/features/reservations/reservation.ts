import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CreateReservationRequest,
  ReservationListResponse,
  ReservationResponse,
  OperationsSummaryResponse,
} from './reservation.models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  create(request: CreateReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  getMine(): Observable<ReservationListResponse> {
    return this.http.get<ReservationListResponse>(`${this.apiUrl}/mine`);
  }

  cancel(id: number): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getPending(): Observable<ReservationListResponse> {
    return this.http.get<ReservationListResponse>(`${this.apiUrl}/pending`);
  }

  review(id: number, action: 'APPROVE' | 'REJECT'): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/review`, { action });
  }

  getOperationsSummary(): Observable<OperationsSummaryResponse> {
    return this.http.get<OperationsSummaryResponse>(`${this.apiUrl}/operations-summary`);
  }
}
