import { firstValueFrom } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('restores the current user from the session endpoint', async () => {
    const restoration = service.restoreSession();
    httpTesting.expectOne(`${environment.apiUrl}/auth/me`).flush({
      user: { id: 7, name: 'Test User', email: 'test@example.com', role: 'STUDENT' },
    });

    await restoration;

    expect(service.user()?.email).toBe('test@example.com');
    expect(service.initialized()).toBe(true);
  });

  it('shares an in-flight session restoration request', async () => {
    const firstRestoration = service.restoreSession();
    const secondRestoration = service.restoreSession();
    const requests = httpTesting.match(`${environment.apiUrl}/auth/me`);

    expect(requests).toHaveLength(1);
    const [request] = requests;
    request.flush({
      user: { id: 7, name: 'Test User', email: 'test@example.com', role: 'STUDENT' },
    });
    await Promise.all([firstRestoration, secondRestoration]);

    expect(service.isAuthenticated()).toBe(true);
  });

  it('does not overwrite a successful login with a stale session response', async () => {
    const restoration = service.restoreSession();
    const sessionRequest = httpTesting.expectOne(`${environment.apiUrl}/auth/me`);
    const login = firstValueFrom(service.login({ email: 'test@example.com', password: 'secret' }));
    httpTesting.expectOne(`${environment.apiUrl}/auth/login`).flush({
      user: { id: 7, name: 'Test User', email: 'test@example.com', role: 'STUDENT' },
    });
    await login;

    sessionRequest.flush({}, { status: 401, statusText: 'Unauthorized' });
    await restoration;

    expect(service.user()?.email).toBe('test@example.com');
  });
});
