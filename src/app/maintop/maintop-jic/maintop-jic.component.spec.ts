import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintopJicComponent } from './maintop-jic.component';

describe('MaintopJicComponent', () => {
  let component: MaintopJicComponent;
  let fixture: ComponentFixture<MaintopJicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintopJicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintopJicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
