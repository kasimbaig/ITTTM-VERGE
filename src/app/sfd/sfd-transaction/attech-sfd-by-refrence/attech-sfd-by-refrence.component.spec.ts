import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttechSfdByRefrenceComponent } from './attech-sfd-by-refrence.component';

describe('AttechSfdByRefrenceComponent', () => {
  let component: AttechSfdByRefrenceComponent;
  let fixture: ComponentFixture<AttechSfdByRefrenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttechSfdByRefrenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttechSfdByRefrenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
