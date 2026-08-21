import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AdminResourceService } from './admin-resource';

describe('AdminResource', () => {
  let service: AdminResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AdminResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
