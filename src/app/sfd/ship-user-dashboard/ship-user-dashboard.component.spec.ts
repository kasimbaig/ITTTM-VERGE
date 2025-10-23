import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipUserDashboardComponent } from './ship-user-dashboard.component';

describe('ShipUserDashboardComponent', () => {
  let component: ShipUserDashboardComponent;
  let fixture: ComponentFixture<ShipUserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipUserDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipUserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
