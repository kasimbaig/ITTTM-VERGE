import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintopDetailsComponent } from './maintop-details.component';

describe('MaintopDetailsComponent', () => {
  let component: MaintopDetailsComponent;
  let fixture: ComponentFixture<MaintopDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintopDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintopDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
