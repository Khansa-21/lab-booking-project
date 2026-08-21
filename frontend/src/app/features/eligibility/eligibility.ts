import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface TrainingRecord {
  id: number;
  completedAt: string;
  equipment: { id: number; name: string; location: string; category?: { id: number; name: string } };
}

@Injectable({ providedIn: 'root' })
export class EligibilityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/training`;

  getMine(): Observable<{ records: TrainingRecord[] }> {
    return this.http.get<{ records: TrainingRecord[] }>(`${this.apiUrl}/mine`);
  }
}
