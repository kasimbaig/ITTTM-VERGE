import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JicSpareComponent } from './jic-spare.component';

describe('JicSpareComponent', () => {
  let component: JicSpareComponent;
  let fixture: ComponentFixture<JicSpareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JicSpareComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JicSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
