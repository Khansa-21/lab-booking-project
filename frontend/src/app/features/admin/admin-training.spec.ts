import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AdminTrainingService } from './admin-training';

describe('AdminTrainingService', () => {
  let service: AdminTrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AdminTrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
