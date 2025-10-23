import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DockyardComponent } from './dockyard.component';

describe('DockyardComponent', () => {
  let component: DockyardComponent;
  let fixture: ComponentFixture<DockyardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DockyardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DockyardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
