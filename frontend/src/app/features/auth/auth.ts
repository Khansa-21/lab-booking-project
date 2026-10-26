import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiErrorResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
  UserProfile,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<UserProfile | null>(null);
  private readonly initializedState = signal(false);
  private sessionRestoration?: Promise<void>;
  private authStateVersion = 0;

  readonly user = this.userState.asReadonly();
  readonly initialized = this.initializedState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly isAdmin = computed(() => this.userState()?.role === 'ADMIN');

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/signup`, request)
      .pipe(tap((response) => this.setUser(response.user)));
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(tap((response) => this.setUser(response.user)));
  }

  logout(): Observable<void> {
    this.authStateVersion += 1;
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.userState.set(null);
        this.initializedState.set(true);
      }),
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, request);
  }

  restoreSession(): Promise<void> {
    if (this.initializedState()) return Promise.resolve();
    if (this.sessionRestoration) return this.sessionRestoration;

    const version = this.authStateVersion;
    this.sessionRestoration = (async () => {
      try {
        const response = await firstValueFrom(
          this.http.get<AuthResponse>(`${environment.apiUrl}/auth/me`),
        );
        if (this.authStateVersion === version) this.userState.set(response.user);
      } catch {
        if (this.authStateVersion === version) this.userState.set(null);
      } finally {
        this.initializedState.set(true);
      }
    })();
    return this.sessionRestoration;
  }

  private setUser(user: UserProfile): void {
    this.authStateVersion += 1;
    this.userState.set(user);
    this.initializedState.set(true);
  }
}

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  const raw = error.error as ApiErrorResponse | { message?: string; error?: { message?: string } } | string | undefined;

  if (typeof raw === 'string' && raw.trim()) {
    return raw;
  }

  if (raw && typeof raw === 'object') {
    const apiError = 'error' in raw ? raw.error : undefined;
    const directMessage = 'message' in raw ? raw.message : undefined;

    if (typeof apiError?.message === 'string' && apiError.message.trim()) {
      return apiError.message;
    }

    if (typeof directMessage === 'string' && directMessage.trim()) {
      return directMessage;
    }
  }

  return error.message || 'Unable to complete the request.';
}
