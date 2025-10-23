import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentNextRoutionDueComponent } from './equipment-next-roution-due.component';

describe('EquipmentNextRoutionDueComponent', () => {
  let component: EquipmentNextRoutionDueComponent;
  let fixture: ComponentFixture<EquipmentNextRoutionDueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentNextRoutionDueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentNextRoutionDueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
