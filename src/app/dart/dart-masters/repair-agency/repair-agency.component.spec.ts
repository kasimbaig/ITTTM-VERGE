import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepairAgencyComponent } from './repair-agency.component';

describe('RepairAgencyComponent', () => {
  let component: RepairAgencyComponent;
  let fixture: ComponentFixture<RepairAgencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepairAgencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepairAgencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
