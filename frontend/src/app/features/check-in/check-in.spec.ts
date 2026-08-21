import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { CheckInService } from './check-in';

describe('CheckInService', () => {
  let service: CheckInService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(CheckInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
