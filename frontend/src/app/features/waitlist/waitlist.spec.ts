import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { WaitlistService } from './waitlist';

describe('Waitlist', () => {
  let service: WaitlistService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(WaitlistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
