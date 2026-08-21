import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceManagement } from './resource-management';

describe('ResourceManagement', () => {
  let component: ResourceManagement;
  let fixture: ComponentFixture<ResourceManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
