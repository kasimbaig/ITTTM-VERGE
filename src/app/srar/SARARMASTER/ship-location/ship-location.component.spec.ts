import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipLocationComponent } from './ship-location.component';

describe('ShipLocationComponent', () => {
  let component: ShipLocationComponent;
  let fixture: ComponentFixture<ShipLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
