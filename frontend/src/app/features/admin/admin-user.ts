import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserProfile } from '../auth/auth.models';

export interface AdminUser extends UserProfile {
  isActive: boolean;
}

export interface CreateTeacherRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/users`;

  getUsers(): Observable<{ users: AdminUser[] }> {
    return this.http.get<{ users: AdminUser[] }>(this.apiUrl);
  }

  createTeacher(request: CreateTeacherRequest): Observable<{ teacher: AdminUser }> {
    return this.http.post<{ teacher: AdminUser }>(`${this.apiUrl}/teachers`, request);
  }
}
