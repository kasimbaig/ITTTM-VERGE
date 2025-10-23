import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipStateComponent } from './ship-state.component';

describe('ShipStateComponent', () => {
  let component: ShipStateComponent;
  let fixture: ComponentFixture<ShipStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
