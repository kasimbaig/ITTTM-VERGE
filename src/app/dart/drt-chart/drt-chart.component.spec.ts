import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrtChartComponent } from './drt-chart.component';

describe('DrtChartComponent', () => {
  let component: DrtChartComponent;
  let fixture: ComponentFixture<DrtChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrtChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrtChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
