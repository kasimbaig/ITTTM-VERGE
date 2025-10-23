import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdHierarchyComponent } from './sfd-hierarchy.component';

describe('SfdHierarchyComponent', () => {
  let component: SfdHierarchyComponent;
  let fixture: ComponentFixture<SfdHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdHierarchyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
