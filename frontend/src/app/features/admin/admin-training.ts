import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface TrainingUser { id: number; name: string; email: string; }
export interface TrainingResource { id: number; name: string; location: string; }
export interface ManagedTrainingRecord {
  id: number;
  completedAt: string;
  user: TrainingUser;
  equipment: TrainingResource;
}
export interface TrainingManagementData {
  resources: TrainingResource[];
  records: ManagedTrainingRecord[];
}

@Injectable({ providedIn: 'root' })
export class AdminTrainingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/training`;

  getManagementData(): Observable<TrainingManagementData> {
    return this.http.get<TrainingManagementData>(`${this.apiUrl}/management`);
  }

  searchUsers(search: string): Observable<{ users: TrainingUser[] }> {
    return this.http.get<{ users: TrainingUser[] }>(`${this.apiUrl}/users`, { params: { search } });
  }

  completeTraining(request: { userId: number; equipmentId: number }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/records`, request);
  }
}
