import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipActivityTypeComponent } from './ship-activity-type.component';

describe('ShipActivityTypeComponent', () => {
  let component: ShipActivityTypeComponent;
  let fixture: ComponentFixture<ShipActivityTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipActivityTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipActivityTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
