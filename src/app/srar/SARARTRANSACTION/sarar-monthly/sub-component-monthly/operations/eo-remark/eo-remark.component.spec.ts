import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EoRemarkComponent } from './eo-remark.component';

describe('EoRemarkComponent', () => {
  let component: EoRemarkComponent;
  let fixture: ComponentFixture<EoRemarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EoRemarkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EoRemarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
