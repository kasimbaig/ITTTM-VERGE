import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DartReportComponent } from './dart-report.component';

describe('DartReportComponent', () => {
  let component: DartReportComponent;
  let fixture: ComponentFixture<DartReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DartReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DartReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
