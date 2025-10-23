import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipActivityComponent } from './ship-activity.component';

describe('ShipActivityComponent', () => {
  let component: ShipActivityComponent;
  let fixture: ComponentFixture<ShipActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
