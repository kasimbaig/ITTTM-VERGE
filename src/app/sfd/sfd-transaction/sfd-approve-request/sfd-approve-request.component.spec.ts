import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdApproveRequestComponent } from './sfd-approve-request.component';

describe('SfdApproveRequestComponent', () => {
  let component: SfdApproveRequestComponent;
  let fixture: ComponentFixture<SfdApproveRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdApproveRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdApproveRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
