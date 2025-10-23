import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequentDefectsComponent } from './frequent-defects.component';

describe('FrequentDefectsComponent', () => {
  let component: FrequentDefectsComponent;
  let fixture: ComponentFixture<FrequentDefectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequentDefectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequentDefectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
