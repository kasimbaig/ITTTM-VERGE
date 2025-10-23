import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GtgParameterComponent } from './gtg-parameter.component';

describe('GtgParameterComponent', () => {
  let component: GtgParameterComponent;
  let fixture: ComponentFixture<GtgParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GtgParameterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GtgParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
