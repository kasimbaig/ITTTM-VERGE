import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynmicFromComponent } from './dynmic-from.component';

describe('DynmicFromComponent', () => {
  let component: DynmicFromComponent;
  let fixture: ComponentFixture<DynmicFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynmicFromComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynmicFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
