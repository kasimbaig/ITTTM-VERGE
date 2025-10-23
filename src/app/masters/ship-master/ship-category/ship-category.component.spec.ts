import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipCategoryComponent } from './ship-category.component';

describe('ShipCategoryComponent', () => {
  let component: ShipCategoryComponent;
  let fixture: ComponentFixture<ShipCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
