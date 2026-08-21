import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInManagement } from './check-in-management';

describe('CheckInManagement', () => {
  let component: CheckInManagement;
  let fixture: ComponentFixture<CheckInManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInManagement],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { provideHttpClient } from '@angular/common/http';
