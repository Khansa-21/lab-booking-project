import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReservationListResponse, ReservationResponse } from '../reservations/reservation.models';

@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/check-in`;

  checkIn(code: string): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, { code });
  }

  getToday(): Observable<ReservationListResponse> {
    return this.http.get<ReservationListResponse>(`${this.apiUrl}/today`);
  }
}
