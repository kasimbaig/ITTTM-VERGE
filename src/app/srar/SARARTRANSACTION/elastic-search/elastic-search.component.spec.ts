import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElasticSearchComponent } from './elastic-search.component';

describe('ElasticSearchComponent', () => {
  let component: ElasticSearchComponent;
  let fixture: ComponentFixture<ElasticSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElasticSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElasticSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
