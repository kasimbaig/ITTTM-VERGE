import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedEquipmentComponent } from './linked-equipment.component';

describe('LinkedEquipmentComponent', () => {
  let component: LinkedEquipmentComponent;
  let fixture: ComponentFixture<LinkedEquipmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkedEquipmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkedEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
