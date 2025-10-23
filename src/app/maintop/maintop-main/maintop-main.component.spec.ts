import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintopMainComponent } from './maintop-main.component';

describe('MaintopMainComponent', () => {
  let component: MaintopMainComponent;
  let fixture: ComponentFixture<MaintopMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintopMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintopMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
