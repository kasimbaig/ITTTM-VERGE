import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LubricantComponent } from './lubricant.component';

describe('LubricantComponent', () => {
  let component: LubricantComponent;
  let fixture: ComponentFixture<LubricantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LubricantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LubricantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
