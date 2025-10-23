import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentSpecificationComponent } from './equipment-specification.component';

describe('EquipmentSpecificationComponent', () => {
  let component: EquipmentSpecificationComponent;
  let fixture: ComponentFixture<EquipmentSpecificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentSpecificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentSpecificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
