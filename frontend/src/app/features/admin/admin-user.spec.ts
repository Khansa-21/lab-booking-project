import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AdminUserService } from './admin-user';

describe('AdminUserService', () => {
  let service: AdminUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AdminUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
