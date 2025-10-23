import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JicToolComponent } from './jic-tool.component';

describe('JicToolComponent', () => {
  let component: JicToolComponent;
  let fixture: ComponentFixture<JicToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JicToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JicToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
