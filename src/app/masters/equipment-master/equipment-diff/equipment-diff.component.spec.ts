import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentDiffComponent } from './equipment-diff.component';

describe('EquipmentDiffComponent', () => {
  let component: EquipmentDiffComponent;
  let fixture: ComponentFixture<EquipmentDiffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentDiffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentDiffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
