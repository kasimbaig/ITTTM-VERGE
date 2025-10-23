import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DartMainComponent } from './dart-main.component';

describe('DartMainComponent', () => {
  let component: DartMainComponent;
  let fixture: ComponentFixture<DartMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DartMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DartMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
