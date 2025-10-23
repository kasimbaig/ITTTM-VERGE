import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OcrcComponent } from './ocrc.component';

describe('OcrcComponent', () => {
  let component: OcrcComponent;
  let fixture: ComponentFixture<OcrcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OcrcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OcrcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
