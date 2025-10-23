import { ComponentFixture, TestBed } from '@angular/core/testing';

import { srarMonthlyComponent } from './srar-monthly.component';

describe('srarMonthlyComponent', () => {
  let component: srarMonthlyComponent;
  let fixture: ComponentFixture<srarMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [srarMonthlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(srarMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
