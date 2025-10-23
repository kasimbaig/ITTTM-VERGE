import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSpecificationComponent } from './generic-specification.component';

describe('GenericSpecificationComponent', () => {
  let component: GenericSpecificationComponent;
  let fixture: ComponentFixture<GenericSpecificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericSpecificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericSpecificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
