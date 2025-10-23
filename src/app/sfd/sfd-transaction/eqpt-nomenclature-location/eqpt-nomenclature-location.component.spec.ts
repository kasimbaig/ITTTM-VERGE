import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EqptNomenclatureLocationComponent } from './eqpt-nomenclature-location.component';

describe('EqptNomenclatureLocationComponent', () => {
  let component: EqptNomenclatureLocationComponent;
  let fixture: ComponentFixture<EqptNomenclatureLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EqptNomenclatureLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EqptNomenclatureLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
