import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { MyReservations } from './my-reservations';

describe('MyReservations', () => {
  let component: MyReservations;
  let fixture: ComponentFixture<MyReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReservations],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MyReservations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
