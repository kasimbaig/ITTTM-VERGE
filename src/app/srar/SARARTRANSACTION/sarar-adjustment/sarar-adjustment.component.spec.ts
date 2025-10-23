import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SararAdjustmentComponent } from './sarar-adjustment.component';

describe('SararAdjustmentComponent', () => {
  let component: SararAdjustmentComponent;
  let fixture: ComponentFixture<SararAdjustmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SararAdjustmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SararAdjustmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
