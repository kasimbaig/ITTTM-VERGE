import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdReportsComponent } from './sfd-reports.component';

describe('SfdReportsComponent', () => {
  let component: SfdReportsComponent;
  let fixture: ComponentFixture<SfdReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
