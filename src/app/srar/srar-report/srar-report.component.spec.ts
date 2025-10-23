import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrarReportComponent } from './srar-report.component';

describe('SrarReportComponent', () => {
  let component: SrarReportComponent;
  let fixture: ComponentFixture<SrarReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SrarReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SrarReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
