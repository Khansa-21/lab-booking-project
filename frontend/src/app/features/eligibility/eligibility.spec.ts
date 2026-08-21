import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { EligibilityService } from './eligibility';

describe('EligibilityService', () => {
  let service: EligibilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(EligibilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
