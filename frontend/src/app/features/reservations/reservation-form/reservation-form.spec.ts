import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { ReservationForm } from './reservation-form';

describe('ReservationForm', () => {
  let component: ReservationForm;
  let fixture: ComponentFixture<ReservationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationForm],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
