import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectStrokeComponent } from './defect-stroke.component';

describe('DefectStrokeComponent', () => {
  let component: DefectStrokeComponent;
  let fixture: ComponentFixture<DefectStrokeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefectStrokeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefectStrokeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
