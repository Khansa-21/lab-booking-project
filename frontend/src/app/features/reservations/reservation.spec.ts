import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';

import { ReservationService } from './reservation';

describe('Reservation', () => {
  let service: ReservationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(ReservationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
