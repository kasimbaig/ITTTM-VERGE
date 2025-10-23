import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropulsionComponent } from './propulsion.component';

describe('PropulsionComponent', () => {
  let component: PropulsionComponent;
  let fixture: ComponentFixture<PropulsionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropulsionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropulsionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
