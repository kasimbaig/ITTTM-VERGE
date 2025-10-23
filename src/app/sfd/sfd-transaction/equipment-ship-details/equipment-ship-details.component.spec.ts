import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentShipDetailsComponent } from './equipment-ship-details.component';

describe('EquipmentShipDetailsComponent', () => {
  let component: EquipmentShipDetailsComponent;
  let fixture: ComponentFixture<EquipmentShipDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentShipDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentShipDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
