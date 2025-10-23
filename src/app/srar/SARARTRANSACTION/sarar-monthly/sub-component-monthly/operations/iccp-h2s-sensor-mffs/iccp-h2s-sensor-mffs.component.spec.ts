import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IccpH2sSensorMffsComponent } from './iccp-h2s-sensor-mffs.component';

describe('IccpH2sSensorMffsComponent', () => {
  let component: IccpH2sSensorMffsComponent;
  let fixture: ComponentFixture<IccpH2sSensorMffsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IccpH2sSensorMffsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IccpH2sSensorMffsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
