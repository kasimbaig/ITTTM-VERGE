import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintopHeaderComponent } from './maintop-header.component';

describe('MaintopHeaderComponent', () => {
  let component: MaintopHeaderComponent;
  let fixture: ComponentFixture<MaintopHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintopHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaintopHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
