import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdLegacyComponent } from './sfd-legacy.component';

describe('SfdLegacyComponent', () => {
  let component: SfdLegacyComponent;
  let fixture: ComponentFixture<SfdLegacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdLegacyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
