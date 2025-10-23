import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FptCstFormComponent } from './fpt-cst-form.component';

describe('FptCstFormComponent', () => {
  let component: FptCstFormComponent;
  let fixture: ComponentFixture<FptCstFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FptCstFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FptCstFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
