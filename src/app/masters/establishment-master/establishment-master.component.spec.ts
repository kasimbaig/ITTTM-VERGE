import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstablishmentMasterComponent } from './establishment-master.component';

describe('EstablishmentMasterComponent', () => {
  let component: EstablishmentMasterComponent;
  let fixture: ComponentFixture<EstablishmentMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstablishmentMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstablishmentMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
