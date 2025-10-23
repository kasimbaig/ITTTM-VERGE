import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemWiseDefectActivityChartComponent } from './system-wise-defect-activity-chart.component';

describe('SystemWiseDefectActivityChartComponent', () => {
  let component: SystemWiseDefectActivityChartComponent;
  let fixture: ComponentFixture<SystemWiseDefectActivityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemWiseDefectActivityChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemWiseDefectActivityChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
