import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManufacturerMasterComponent } from './manufacturer-master.component';

describe('ManufacturerMasterComponent', () => {
  let component: ManufacturerMasterComponent;
  let fixture: ComponentFixture<ManufacturerMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManufacturerMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManufacturerMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
