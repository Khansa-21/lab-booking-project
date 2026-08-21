import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityTimeline } from './availability-timeline';

describe('AvailabilityTimeline', () => {
  let component: AvailabilityTimeline;
  let fixture: ComponentFixture<AvailabilityTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailabilityTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
