import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HideEquipmentDetailsComponent } from './hide-equipment-details.component';

describe('HideEquipmentDetailsComponent', () => {
  let component: HideEquipmentDetailsComponent;
  let fixture: ComponentFixture<HideEquipmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HideEquipmentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HideEquipmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
