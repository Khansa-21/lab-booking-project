import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingManagement } from './training-management';

describe('TrainingManagement', () => {
  let component: TrainingManagement;
  let fixture: ComponentFixture<TrainingManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingManagement],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(TrainingManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { provideHttpClient } from '@angular/common/http';
