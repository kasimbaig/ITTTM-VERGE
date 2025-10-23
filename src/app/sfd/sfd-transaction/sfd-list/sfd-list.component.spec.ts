import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SfdListComponent } from './sfd-list.component';

describe('SfdListComponent', () => {
  let component: SfdListComponent;
  let fixture: ComponentFixture<SfdListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SfdListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SfdListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
