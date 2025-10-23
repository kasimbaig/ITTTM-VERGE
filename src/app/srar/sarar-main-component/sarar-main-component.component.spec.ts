import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdMainComponentComponent } from './sarar-main-component.component';

describe('SfdMainComponentComponent', () => {
  let component: SfdMainComponentComponent;
  let fixture: ComponentFixture<SfdMainComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdMainComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdMainComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
