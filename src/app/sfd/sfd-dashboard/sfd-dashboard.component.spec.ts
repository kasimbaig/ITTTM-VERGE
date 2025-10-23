import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdDashboardComponent } from './sfd-dashboard.component';

describe('SfdDashboardComponent', () => {
  let component: SfdDashboardComponent;
  let fixture: ComponentFixture<SfdDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
