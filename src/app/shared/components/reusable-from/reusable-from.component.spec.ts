import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableFromComponent } from './reusable-from.component';

describe('ReusableFromComponent', () => {
  let component: ReusableFromComponent;
  let fixture: ComponentFixture<ReusableFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableFromComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
