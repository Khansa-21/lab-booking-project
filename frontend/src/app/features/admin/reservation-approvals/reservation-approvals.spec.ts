import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationApprovals } from './reservation-approvals';

describe('ReservationApprovals', () => {
  let component: ReservationApprovals;
  let fixture: ComponentFixture<ReservationApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
