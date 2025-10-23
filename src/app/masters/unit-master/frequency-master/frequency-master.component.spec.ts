import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyMasterComponent } from './frequency-master.component';

describe('FrequencyMasterComponent', () => {
  let component: FrequencyMasterComponent;
  let fixture: ComponentFixture<FrequencyMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrequencyMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrequencyMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
