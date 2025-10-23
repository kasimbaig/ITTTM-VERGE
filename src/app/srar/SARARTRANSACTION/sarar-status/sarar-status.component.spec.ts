import { ComponentFixture, TestBed } from '@angular/core/testing';

import { srarStatusComponent } from './srar-status.component';

describe('srarStatusComponent', () => {
  let component: srarStatusComponent;
  let fixture: ComponentFixture<srarStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [srarStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(srarStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
