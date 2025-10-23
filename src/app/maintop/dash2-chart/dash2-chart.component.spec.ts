import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dash2ChartComponent } from './dash2-chart.component';

describe('Dash2ChartComponent', () => {
  let component: Dash2ChartComponent;
  let fixture: ComponentFixture<Dash2ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dash2ChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Dash2ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
