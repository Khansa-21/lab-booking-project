import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEligibility } from './my-eligibility';

describe('MyEligibility', () => {
  let component: MyEligibility;
  let fixture: ComponentFixture<MyEligibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEligibility],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MyEligibility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { provideHttpClient } from '@angular/common/http';
