import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpsAuthorityComponent } from './ops-authority.component';

describe('OpsAuthorityComponent', () => {
  let component: OpsAuthorityComponent;
  let fixture: ComponentFixture<OpsAuthorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpsAuthorityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpsAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
