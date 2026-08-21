import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  JoinWaitlistRequest,
  WaitlistEntryResponse,
  WaitlistListResponse,
} from './waitlist.models';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/waitlist`;

  join(request: JoinWaitlistRequest): Observable<WaitlistEntryResponse> {
    return this.http.post<WaitlistEntryResponse>(this.apiUrl, request);
  }

  getMine(): Observable<WaitlistListResponse> {
    return this.http.get<WaitlistListResponse>(`${this.apiUrl}/mine`);
  }

  cancel(id: number): Observable<WaitlistEntryResponse> {
    return this.http.patch<WaitlistEntryResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
