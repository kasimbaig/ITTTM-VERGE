import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DgufComponent } from './dguf.component';

describe('DgufComponent', () => {
  let component: DgufComponent;
  let fixture: ComponentFixture<DgufComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DgufComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DgufComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
