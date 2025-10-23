import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryDistComponent } from './library-dist.component';

describe('LibraryDistComponent', () => {
  let component: LibraryDistComponent;
  let fixture: ComponentFixture<LibraryDistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibraryDistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryDistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
