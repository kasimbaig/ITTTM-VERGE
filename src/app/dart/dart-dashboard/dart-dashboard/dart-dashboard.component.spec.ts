import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DartDashboardComponent } from './dart-dashboard.component';

describe('DartDashboardComponent', () => {
  let component: DartDashboardComponent;
  let fixture: ComponentFixture<DartDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DartDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DartDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
