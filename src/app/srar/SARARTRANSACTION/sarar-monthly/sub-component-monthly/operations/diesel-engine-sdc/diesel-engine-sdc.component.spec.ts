import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DieselEngineSdcComponent } from './diesel-engine-sdc.component';

describe('DieselEngineSdcComponent', () => {
  let component: DieselEngineSdcComponent;
  let fixture: ComponentFixture<DieselEngineSdcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DieselEngineSdcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DieselEngineSdcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
