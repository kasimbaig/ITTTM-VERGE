import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintopDashboardComponent } from './maintop-dashboard.component';

describe('MaintopDashboardComponent', () => {
  let component: MaintopDashboardComponent;
  let fixture: ComponentFixture<MaintopDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintopDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintopDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
