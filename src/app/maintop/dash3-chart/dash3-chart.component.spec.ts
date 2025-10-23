import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dash3ChartComponent } from './dash3-chart.component';

describe('Dash3ChartComponent', () => {
  let component: Dash3ChartComponent;
  let fixture: ComponentFixture<Dash3ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dash3ChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dash3ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
