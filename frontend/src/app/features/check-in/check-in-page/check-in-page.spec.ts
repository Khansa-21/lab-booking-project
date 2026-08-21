import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { CheckInPage } from './check-in-page';

describe('CheckInPage', () => {
  let component: CheckInPage;
  let fixture: ComponentFixture<CheckInPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInPage],
      providers: [
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['id', '1']]) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckInPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
