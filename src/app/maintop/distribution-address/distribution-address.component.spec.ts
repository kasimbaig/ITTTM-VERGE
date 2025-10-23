import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionAddressComponent } from './distribution-address.component';

describe('DistributionAddressComponent', () => {
  let component: DistributionAddressComponent;
  let fixture: ComponentFixture<DistributionAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistributionAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
