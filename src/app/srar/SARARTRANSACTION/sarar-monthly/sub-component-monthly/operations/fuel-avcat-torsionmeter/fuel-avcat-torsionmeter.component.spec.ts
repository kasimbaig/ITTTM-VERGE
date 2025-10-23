import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelAvcatTorsionmeterComponent } from './fuel-avcat-torsionmeter.component';

describe('FuelAvcatTorsionmeterComponent', () => {
  let component: FuelAvcatTorsionmeterComponent;
  let fixture: ComponentFixture<FuelAvcatTorsionmeterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelAvcatTorsionmeterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelAvcatTorsionmeterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
