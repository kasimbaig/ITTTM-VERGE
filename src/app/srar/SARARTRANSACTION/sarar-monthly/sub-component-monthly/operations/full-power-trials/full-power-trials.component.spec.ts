import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPowerTrialsComponent } from './full-power-trials.component';

describe('FullPowerTrialsComponent', () => {
  let component: FullPowerTrialsComponent;
  let fixture: ComponentFixture<FullPowerTrialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullPowerTrialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullPowerTrialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
