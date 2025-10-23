import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashJicTableComponent } from './dash-jic-table.component';

describe('DashJicTableComponent', () => {
  let component: DashJicTableComponent;
  let fixture: ComponentFixture<DashJicTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashJicTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashJicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
