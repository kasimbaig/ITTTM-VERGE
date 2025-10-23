import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipGroupComponent } from './ship-group.component';

describe('ShipGroupComponent', () => {
  let component: ShipGroupComponent;
  let fixture: ComponentFixture<ShipGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
