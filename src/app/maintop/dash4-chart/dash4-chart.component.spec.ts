import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dash4ChartComponent } from './dash4-chart.component';

describe('Dash4ChartComponent', () => {
  let component: Dash4ChartComponent;
  let fixture: ComponentFixture<Dash4ChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dash4ChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dash4ChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
