import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GTParameterComponent } from './g-t-parameter.component';

describe('GTParameterComponent', () => {
  let component: GTParameterComponent;
  let fixture: ComponentFixture<GTParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GTParameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GTParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
