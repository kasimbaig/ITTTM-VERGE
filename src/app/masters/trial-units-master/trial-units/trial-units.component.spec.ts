import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrialUnitsComponent } from './trial-units.component';

describe('TrialUnitsComponent', () => {
  let component: TrialUnitsComponent;
  let fixture: ComponentFixture<TrialUnitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrialUnitsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrialUnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
