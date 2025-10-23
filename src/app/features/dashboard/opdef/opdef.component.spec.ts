import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpdefComponent } from './opdef.component';

describe('OpdefComponent', () => {
  let component: OpdefComponent;
  let fixture: ComponentFixture<OpdefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdefComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpdefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
