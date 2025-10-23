import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipRunningDetailComponent } from './ship-running-detail.component';

describe('ShipRunningDetailComponent', () => {
  let component: ShipRunningDetailComponent;
  let fixture: ComponentFixture<ShipRunningDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipRunningDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipRunningDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
