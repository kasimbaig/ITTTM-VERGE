import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmoduleComponent } from './submodule.component';

describe('SubmoduleComponent', () => {
  let component: SubmoduleComponent;
  let fixture: ComponentFixture<SubmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmoduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
