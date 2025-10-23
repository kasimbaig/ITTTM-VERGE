import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JicAttachmentComponent } from './jic-attachment.component';

describe('JicAttachmentComponent', () => {
  let component: JicAttachmentComponent;
  let fixture: ComponentFixture<JicAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JicAttachmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JicAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
