import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitGroupComponent } from './unit-group.component';

describe('UnitGroupComponent', () => {
  let component: UnitGroupComponent;
  let fixture: ComponentFixture<UnitGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
