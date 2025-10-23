import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipActivityDetailComponent } from './ship-activity-detail.component';

describe('ShipActivityDetailComponent', () => {
  let component: ShipActivityDetailComponent;
  let fixture: ComponentFixture<ShipActivityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipActivityDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
