import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentGroupComponent } from './equipment-group.component';

describe('EquipmentGroupComponent', () => {
  let component: EquipmentGroupComponent;
  let fixture: ComponentFixture<EquipmentGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
