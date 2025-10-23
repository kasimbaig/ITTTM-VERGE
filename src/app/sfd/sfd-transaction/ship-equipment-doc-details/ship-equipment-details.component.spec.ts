import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipEquipmentDetailsComponent } from './ship-equipment-details.component';

describe('ShipEquipmentDetailsComponent', () => {
  let component: ShipEquipmentDetailsComponent;
  let fixture: ComponentFixture<ShipEquipmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipEquipmentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipEquipmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
