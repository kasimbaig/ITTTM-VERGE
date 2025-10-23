import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdCommonEquipmentComponentComponent } from './sfd-common-equipment-component.component';

describe('SfdCommonEquipmentComponentComponent', () => {
  let component: SfdCommonEquipmentComponentComponent;
  let fixture: ComponentFixture<SfdCommonEquipmentComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdCommonEquipmentComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdCommonEquipmentComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
