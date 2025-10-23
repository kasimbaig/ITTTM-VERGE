import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdChangeRequestComponent } from './sfd-change-request.component';

describe('SfdChangeRequestComponent', () => {
  let component: SfdChangeRequestComponent;
  let fixture: ComponentFixture<SfdChangeRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdChangeRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
