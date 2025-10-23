import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubComponentMonthlyComponent } from './sub-component-monthly.component';

describe('SubComponentMonthlyComponent', () => {
  let component: SubComponentMonthlyComponent;
  let fixture: ComponentFixture<SubComponentMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubComponentMonthlyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubComponentMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
