import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentHierarchyComponent } from './equipment-hierarchy.component';

describe('EquipmentHierarchyComponent', () => {
  let component: EquipmentHierarchyComponent;
  let fixture: ComponentFixture<EquipmentHierarchyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentHierarchyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
