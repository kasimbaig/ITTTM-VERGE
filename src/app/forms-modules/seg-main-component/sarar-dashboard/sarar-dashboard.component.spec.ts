import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SararDashboardComponent } from './sarar-dashboard.component';

describe('SararDashboardComponent', () => {
  let component: SararDashboardComponent;
  let fixture: ComponentFixture<SararDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SararDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SararDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
