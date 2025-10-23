import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipMasterComponent } from './ship-master.component';

describe('ShipMasterComponent', () => {
  let component: ShipMasterComponent;
  let fixture: ComponentFixture<ShipMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
