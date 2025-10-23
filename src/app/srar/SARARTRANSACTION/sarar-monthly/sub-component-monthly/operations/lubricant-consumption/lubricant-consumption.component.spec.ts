import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LubricantConsumptionComponent } from './lubricant-consumption.component';

describe('LubricantConsumptionComponent', () => {
  let component: LubricantConsumptionComponent;
  let fixture: ComponentFixture<LubricantConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LubricantConsumptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LubricantConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
