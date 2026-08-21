import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { MyWaitlist } from './my-waitlist';

describe('MyWaitlist', () => {
  let component: MyWaitlist;
  let fixture: ComponentFixture<MyWaitlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyWaitlist],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MyWaitlist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
