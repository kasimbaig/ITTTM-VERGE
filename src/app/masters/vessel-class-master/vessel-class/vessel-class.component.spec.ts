import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VesselClassComponent } from './vessel-class.component';

describe('VesselClassComponent', () => {
  let component: VesselClassComponent;
  let fixture: ComponentFixture<VesselClassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VesselClassComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VesselClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
