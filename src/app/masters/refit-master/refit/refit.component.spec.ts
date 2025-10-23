import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefitComponent } from './refit.component';

describe('RefitComponent', () => {
  let component: RefitComponent;
  let fixture: ComponentFixture<RefitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
