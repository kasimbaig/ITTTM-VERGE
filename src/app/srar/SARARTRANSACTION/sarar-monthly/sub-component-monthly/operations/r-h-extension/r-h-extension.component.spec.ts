import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RHExtensionComponent } from './r-h-extension.component';

describe('RHExtensionComponent', () => {
  let component: RHExtensionComponent;
  let fixture: ComponentFixture<RHExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RHExtensionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RHExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
