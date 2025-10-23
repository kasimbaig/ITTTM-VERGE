import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashChart1Component } from './dash-chart1.component';

describe('DashChart1Component', () => {
  let component: DashChart1Component;
  let fixture: ComponentFixture<DashChart1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashChart1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashChart1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
