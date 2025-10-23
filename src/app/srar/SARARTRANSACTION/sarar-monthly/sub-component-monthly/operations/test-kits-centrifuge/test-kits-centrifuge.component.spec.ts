import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestKitsCentrifugeComponent } from './test-kits-centrifuge.component';

describe('TestKitsCentrifugeComponent', () => {
  let component: TestKitsCentrifugeComponent;
  let fixture: ComponentFixture<TestKitsCentrifugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestKitsCentrifugeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestKitsCentrifugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
