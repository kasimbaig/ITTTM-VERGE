import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryDistDetailComponent } from './library-dist-detail.component';

describe('LibraryDistDetailComponent', () => {
  let component: LibraryDistDetailComponent;
  let fixture: ComponentFixture<LibraryDistDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryDistDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryDistDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
